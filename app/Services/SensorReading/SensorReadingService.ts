import BaseService from "App/Base/Services/BaseService"
import SensorReadingRepository from "App/Repositories/SensorReading/SensorReadingRepository"
import { DateTime } from "luxon"

interface RangeFilter {
  start?: DateTime
  end?: DateTime
}

interface SensorMessage {
  [key: string]: any // Define the structure of the sensor message
}

interface FormattedSearchResponse {
  [sensorName: string]: {
    date: string;
    hour?: number;
    day?: number;
    [metric: string]: any;
  }[];
}

export default class SensorReadingService extends BaseService {
  constructor() {
    super(new SensorReadingRepository())
  }

  public async search(filters?: any) {
    const { isLatest } = filters || {}

    if (isLatest) {
      const latestReadings = await this.repository.getLatestReadings()

      return Object.fromEntries(
        latestReadings.map(reading => [reading.name, reading.payload])
      )
    }

    const { startDate, endDate } = this.determineDateRange(filters.range)

    const searchOptions = {
      sensors: filters?.sensor,
      metrics: filters?.metric,
      interval: filters.range?.time_range === 'HOURLY' ? 'hour' : 'day', // Default to HOURLY if not provided
      startDate: startDate.toISO(), // Convert to  ISO date string
      endDate: endDate.toISO(),
    }

    const rawResults = await this.repository.search(searchOptions)

    if (!rawResults || rawResults.length === 0) {
      return {};
    }

    const formattedResult = rawResults.reduce((accumulator, currentRow) => {
      // Destructure the row. 'rest' will contain either the metrics or the payload object.
      const { sensor_name, time_bucket, payloads, ...rest } = currentRow;

      if (!accumulator[sensor_name]) {
        accumulator[sensor_name] = [];
      }

      let metrics: { [key: string]: any } = {};

      // --- KEY CHANGE: REWRITTEN AVERAGING LOGIC ---

      if (payloads && Array.isArray(payloads)) {
        // Case 1: No specific metrics were requested. 'payloads' is an array that we must average.
        const sums: { [key: string]: number } = {};
        const counts: { [key: string]: number } = {};

        // Iterate through each payload object in the aggregated array
        for (const payload of payloads) {
          // Iterate through each key in the individual payload object
          for (const key in payload) {
            const value = payload[key];
            if (typeof value === 'number' && isFinite(value)) {
              sums[key] = (sums[key] || 0) + value;
              counts[key] = (counts[key] || 0) + 1;
            }
          }
        }

        // Calculate the final averages
        for (const key in sums) {
          // Ensure we round to a reasonable number of decimal places
          metrics[key] = parseFloat((sums[key] / counts[key]).toFixed(2));
        }

      } else {
        // Case 2: Specific metrics were requested and already averaged by the database.
        metrics = rest;
      }

      if (Object.keys(metrics).length === 0) {
        return accumulator; // Skip if no valid metrics were found
      }

      // Convert the time_bucket to a DateTime object
      const ts = DateTime.fromJSDate(time_bucket)

      // Create the new data point, spreading the correct metrics object
      const dataPoint: any = {
        date: ts.toISODate(), // Use ISO date format for consistency
        ...metrics
      };

      if (searchOptions.interval === 'hour') {
        dataPoint.hour = ts.hour;
      } else {
        dataPoint.day = ts.day;
      }

      accumulator[sensor_name].push(dataPoint);

      return accumulator;
    }, {} as FormattedSearchResponse);

    return formattedResult;
  }

  private determineDateRange(range?: RangeFilter): { startDate: DateTime; endDate: DateTime } {
    const safeRange = range || {}
    let startDate: DateTime
    let endDate: DateTime

    if (safeRange.start && !safeRange.end) {
      startDate = safeRange.start.startOf('day').toUTC() // Ensure start date is in UTC
      endDate = safeRange.start.plus({ days: 7 }).endOf('day').toUTC() // Default to 7 days after start date
    } else if (!safeRange.start && safeRange.end) {
      endDate = safeRange.end.endOf('day').toUTC()
      startDate = safeRange.end.minus({ days: 7 }).startOf('day').toUTC()
    } else if (safeRange.start && safeRange.end) {
      startDate = safeRange.start.startOf('day').toUTC()
      endDate = safeRange.end.endOf('day').toUTC()
    } else {
      endDate = DateTime.now().endOf('day').toUTC() // Default to today
      startDate = endDate.minus({ days: 7 }).startOf('day').toUTC() // Default to 7 days ago
    }

    return { startDate, endDate }
  }

  public async handleIncomingMessage(msg: any) {

    const entries = Object.entries(msg)
    const sensorMap = await this.repository.fetchSensorMap()

    for (const [sensorKey, payload] of entries) {
      const sensorId = sensorMap[sensorKey]

      if (!sensorId) continue // Skip if sensorKey is not recognized

      if (!this.isValidSensorMessage(payload)) continue // Skip if payload is not a valid sensor message

      const readAt = DateTime.fromFormat(payload.time, 'yyyy-MM-dd HH:mm:ss', { zone: 'Asia/Jakarta' }).toUTC() // Convert to UTC
      const { time, ...data } = payload

      await this.repository.store({
        sensorId,
        payload: data,
        readAt,
      })
    }
  }

  private isValidSensorMessage(data: unknown): data is SensorMessage {
    return typeof data === 'object' && data !== null
  }
}
