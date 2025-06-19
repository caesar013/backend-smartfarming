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

export default class SensorReadingService extends BaseService {
  constructor() {
    super(new SensorReadingRepository())
  }

  public async search(filters?: any) {
    const { isLatest } = filters || {}
    if (isLatest) {
      const latestReadings = await this.repository.getLatestReadings()

      const formattedReadings = latestReadings.reduce((accumulator, currentReading) => {
        const sensor_name = currentReading.name.replace('_', '').toLowerCase() // Convert to lowercase and remove underscores
        accumulator[sensor_name] = currentReading.payload
        return accumulator
      }, {})

      return formattedReadings
    }

    const { startDate, endDate } = this.determineDateRange(filters.range)

    const searchOptions = {
      sensors: filters?.sensor,
      metrics: filters?.metric,
      // default to HOURLY if not provided
      interval: filters.range?.time_range === 'HOURLY' ? 'hour' : 'day', // Default to HOURLY if not provided
      startDate: startDate.toISO(), // Convert to  ISO date string
      endDate: endDate.toISO(),
    }

    return this.repository.search(searchOptions)
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
