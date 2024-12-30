import BaseService from "App/Base/Services/BaseService"
import { DHT } from "App/Enums/DHT"
import { NPK } from "App/Enums/NPK"
import { SENSOR } from "App/Enums/SENSOR"
import { TABLE } from "App/Enums/TABLE"
import SensorRepository from "App/Repositories/Sensor/SensorRepository"
import { DateTime } from "luxon"

export default class SensorService extends BaseService {
  constructor() {
    super(new SensorRepository())
  }

  async getAll(options: any) {
    try {
      const res = await this.repository.getAll(options.sensor, options.table, options.metric, options.range)
      return this.parseResponse(res, 'OK', 200, 'CALCULATED')
    } catch (error) {
      throw error
    }
  }

  async getLatest() {
    try {
      const res = await this.repository.getLatest(TABLE)
      return this.parseResponse(res, 'OK', 200, 'RAW')
    } catch (error) {
      throw error
    }
  }

  parseParams(data: any, time_range: any) {
    const parsedRequest = this.parseRequest(data)
    const range = this.parseRangeType(parsedRequest.time_range, time_range)
    const parsedSensor = this.parseSensor(parsedRequest.sensor)
    const tables = this.parseTable(parsedSensor, range)
    const parsedMetric = this.parseMetric(parsedRequest.metric, tables)
    const parsedRange = this.parseRange(parsedRequest.range, parsedSensor, time_range[range])

    return {
      sensor: parsedSensor,
      table: tables,
      metric: parsedMetric,
      range: parsedRange
    }
  }

  parseResponse(data: any, message?: string, status?: number, type?: string) {
    const parsedResponse = this.parseDataResponse(data, type === 'RAW' ? true : false)

    return {
      data: parsedResponse,
      statusCode: status,
      message: message,
    }
  }

  private parseDataResponse(data: any, type: boolean) {
    const parsedData = Object.fromEntries( // convert array to object using Object.fromEntries
      Object.entries(data).map(([key, value]) => [
        key.replace('_', ''), // modify the key
        type ? value :
          Array.isArray(value) ?
            value.map((item: any) => this.parseData(item)) :
            this.parseData(value), // conditionally transform the value
      ])
    );
    return parsedData
  }

  private parseData(data: any) {
    let parsedData: any = {}

    Object.keys(data).forEach(key => {
      if (key === 'day' || key === 'hour') {
        let time = this.getTime(data.day, data.hour)
        let date = data.day ?? data.hour
        date = DateTime.fromISO(date.toISOString(), { zone: 'Asia/Jakarta' }).toISODate()

        parsedData[key] = time
        parsedData['date'] = date
      } else {
        parsedData[key] = this.getData(data[key])
      }
    })
    return parsedData
  }

  private getTime(day: any, hour: any) {
    let time: any
    if (day) {
      time = DateTime.fromISO(day.toISOString(), { zone: 'Asia/Jakarta' }).day
    } else if (hour) {
      time = DateTime.fromISO(hour.toISOString(), { zone: 'Asia/Jakarta' }).hour
    }
    return time
  }

  private getData(data: any) {
    let parsedData = parseFloat(data) / 100
    return parsedData
  }

  private parseRequest(data: any) {
    if (data) {
      let parsedRequest: any = {}
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string') {
          parsedRequest[key] = [data[key]]
        } else if (typeof data[key] === 'object') {
          parsedRequest[key] = data[key]
        }
      })
      return parsedRequest
    }
  }

  private parseSensor(data: any) {
    if (data) {
      let parsedSensor: any = {}
      data.forEach((d: string) => {
        let key = Object.keys(SENSOR).find(key => SENSOR[key] === d) as string // get the key from the value
        if (SENSOR[key]) {
          parsedSensor[key] = SENSOR[key]
        }
      })
      return parsedSensor
    } else {
      return SENSOR
    }
  }

  private parseTable(data: any, range: string) {
    let tables: any = {}
    Object.keys(data).forEach(key => {
      let modifiedKey = key + '_' + range.toUpperCase()
      let table = TABLE[modifiedKey as keyof typeof TABLE] // powerful typechecking feature
      if (table) {
        tables[key] = table
      }
    })
    return tables
  }

  private parseMetric(data: any, tables: any) {
    let parsedMetric: any = {}
    Object.keys(tables).forEach(key => {
      let modifiedKey = key.split('_')[0].toLowerCase()
      if (modifiedKey === 'dht') {
        parsedMetric[key] = this.getAllowedMetric(data, DHT)
      } else if (modifiedKey === 'npk') {
        parsedMetric[key] = this.getAllowedMetric(data, NPK)
      }
    })
    return parsedMetric
  }

  private parseRange(data: any, sensor: any, time_range: string) {
    let parsedRange: any = {}
    Object.keys(sensor).forEach(key => {
      parsedRange[key] = this.getRange(data, time_range)
    })
    return parsedRange
  }

  private getAllowedMetric(data: any, metric: any) {
    let parsedMetric: any = {}
    if (data) {
      data.forEach((d: string) => {
        let key = Object.keys(metric).find(key => metric[key] === d)
        if (key) {
          parsedMetric[key] = metric[key]
        }
      })
    }
    if (Object.keys(parsedMetric).length === 0) {
      return Object.keys(metric)
        .filter((key) => key !== 'READ_AT')
        .reduce((result: Record<string, any>, key) => {
          result[key] = metric[key];
          return result;
        }, {});
    }
    return parsedMetric
  }

  private getRange(data: any, time_range: any) {
    const start = this.getStart(data?.start, data?.end) // ?. is optional chaining to prevent error if data is null
    const end = this.getEnd(data?.end, data?.start)

    const check = (start?.toISO() ?? '') < (end?.toISO() ?? '')
    // prevent invalid range
    if (!check) {
      return {
        start: end.plus({ millisecond: 1 }), // set to the next day
        end: start.minus({ millisecond: 1 }), // set to the previous day
        time_range: time_range
      }
    }
    return {
      start: start,
      end: end,
      time_range: time_range
    }
  }

  private getStart(data: string, end: string) {
    if (data) {
      return DateTime.fromISO(data, { zone: 'Asia/Jakarta' }).toUTC()
    } else if (!data && end) {
      return DateTime.fromISO(end, { zone: 'Asia/Jakarta' }).minus({ days: 7 }).startOf('day').toUTC()
    } else {
      return DateTime.now().setZone('Asia/Jakarta').minus({ days: 7 }).startOf('day').toUTC()
    }
  }

  private getEnd(data: string, start: string) {
    if (data) {
      return DateTime.fromISO(data, { zone: 'Asia/Jakarta' }).endOf('day').toUTC()
    } else if (!data && start) {
      return DateTime.fromISO(start, { zone: 'Asia/Jakarta' }).plus({ days: 7 }).endOf('day').toUTC()
    } else {
      return DateTime.now().setZone('Asia/Jakarta').endOf('day').toUTC()
    }
  }

  private parseRangeType(data: string, time_range: any) {
    if (data && time_range[data]) {
      return data[0]
    } else {
      return 'DAILY'
    }
  }

  public static async handleMessage(data: any) {
    let transformedData: any = {}
    let time = data['time']
    Object.keys(data).forEach(async key => {
      if (key.toLowerCase() === SENSOR.DHT) {
        transformedData = await this.transformMessage(data[key], DHT)
      } else if (key.toLowerCase() === SENSOR.NPK_1 || key.toLowerCase() === SENSOR.NPK_2) {
        transformedData = await this.transformMessage(data[key], NPK)
      } else {
        return
      }
      transformedData['read_at'] = time
      const sensor = Object.keys(SENSOR).find(k => SENSOR[k as keyof typeof SENSOR] === key)?.toLowerCase();
      await SensorRepository.storeData(transformedData, sensor)
    })
    if (DateTime.utc().minute === 0 && (DateTime.utc().second >= 0 && DateTime.utc().second <= 10)) {
      await SensorRepository.storeDataByRange('hourly')
      if (DateTime.local({ zone: 'Asia/Jakarta' }).hour === 0) {
        await SensorRepository.storeDataByRange('daily')
      }
    }
  }

  private static async transformMessage(data: any, metrics: any) {
    let transformedData: any = {}
    Object.values(metrics).forEach((value: string) => {
      let key = Object.keys(metrics).find(key => metrics[key] === value)?.toLowerCase() as string // powerful typechecking feature
      transformedData[key] = (data[value] > 0 || data[value] != null) ? data[value] : 0;
    })
    return transformedData
  }
}
