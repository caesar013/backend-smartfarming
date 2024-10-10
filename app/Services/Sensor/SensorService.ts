import BaseService from "App/Base/Services/BaseService"
import SensorRepository from "App/Repositories/Sensor/SensorRepository"
import { DateTime } from "luxon"

export default class SensorService extends BaseService {
  constructor() {
    super(new SensorRepository())
  }

  async getAll(options: any) {
    try {
      return await this.repository.getAll(options.sensor, options.table, options.metric, options.range)
    } catch (error) {
      throw error
    }
  }

  parseParams(data: any, sensor: any, table: any, metric: any, time_range: any) {
    const parsedRequest = this.parseRequest(data)
    const parsedSensor = this.parseSensor(parsedRequest.sensor, sensor)
    const tables = this.parseTable(parsedSensor, table)
    const parsedMetric = this.parseMetric(parsedRequest.metric, parsedSensor, metric)
    const parsedRange = this.parseRange(parsedRequest.range, parsedSensor, time_range)

    return {
      sensor: parsedSensor,
      table: tables,
      metric: parsedMetric,
      range: parsedRange
    }
  }

  parseResponse(data: any, message?: string, status?: number) {
    const parsedResponse = this.parseDataResponse(data)

    return {
      data: parsedResponse,
      statusCode: status,
      message: message,
    }
  }

  parseDataResponse(data: any) {
    let parsedData: any = {}
    Object.keys(data).forEach(key => {
      parsedData[key] = []
      data[key].forEach((d: any) => {
        parsedData[key].push(this.parseData(d))
      })
    })
    return parsedData
  }

  parseData(data: any) {
    let parsedData: any = {}

    Object.keys(data).forEach(key => {
      if (key === 'day' || key === 'hour') {
        let date = this.getDate(data.day, data.hour)
        parsedData[key] = date
      } else {
        parsedData[key] = this.getData(data[key], key)
      }
    })
    return parsedData
  }

  getDate(day: any, hour: any) {
    let time: any
    if (day) {
      time = (DateTime.fromISO(day.toISOString(), {zone: 'Asia/Jakarta'}).day)
    } else if (hour) {
      time = (DateTime.fromISO(hour.toISOString()).hour + 7) % 24
    }
    return time
  }

  getData(data: any, key: string) {
    let parsedData = Math.round(parseFloat(data))

    if (key.includes('vici')) {
      parsedData = parsedData / 100
    } else  if (key.includes('ph')) {
      parsedData = parsedData / 10
    } else {
      parsedData = parsedData
    }
    return parsedData
  }

  parseRequest(data: any) {
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

  parseSensor(data: any, allowedSensor: any) {
    if (data) {
      let parsedSensor: any = {}
      data.forEach((d: any) => {
        if (allowedSensor[d]) {
          parsedSensor[d] = allowedSensor[d]
        }
      })
      return parsedSensor
    } else {
      return allowedSensor
    }
  }

  parseTable(data: any, allowedTable: any) {
    let tables: any = {}
    Object.keys(data).forEach(key => {
      Object.keys(allowedTable).forEach(k => {
        if (key.includes(k)) {
          tables[key] = allowedTable[k]
        }
      })
    })
    return tables
  }

  parseMetric(data: any, sensor: any, metric: any) {
    let parsedMetric: any = {}
    Object.keys(metric).forEach(key => {
      Object.keys(sensor).forEach(k => {
        if (k.includes(key)) {
          parsedMetric[k] = this.getAllowedMetric(metric[key], data)
        }
      })
    })
    return parsedMetric
  }

  parseRange(data: any, sensor: any, time_range: string) {
    let parsedRange: any = {}
    Object.keys(sensor).forEach(key => {
      parsedRange[key] = this.getRange(data, time_range)
    })
    return parsedRange
  }

  getAllowedMetric(metric: any, sensor: any) {
    let parsedMetric: any = {}
    if (sensor) {
      sensor.forEach((d: string) => {
        if (metric[d]) {
          parsedMetric[d] = metric[d]
        }
      })
    }
    if (Object.keys(parsedMetric).length === 0) {
      return metric
    }
    return parsedMetric
  }

  getRange(data: any, time_range: any) {
    const start = this.getStart(data?.start, data?.end) // ?. is optional chaining to prevent error if data is null
    const end = this.getEnd(data?.end, data?.start)
    const range = this.getRangeType(data?.time_range, time_range)

    return {
      start: start,
      end: end,
      time_range: range
    }
  }

  getStart(data: string, end: string) {
    if (data) {
      return DateTime.fromISO(data).toUTC()
    } else if (!data && end) {
      return DateTime.fromISO(end).minus({ days: 7 }).startOf('day').toUTC()
    } else {
      return DateTime.now().minus({ days: 7 }).startOf('day').toUTC()
    }
  }

  getEnd(data: string, start: string) {
    if (data) {
      return DateTime.fromISO(data).endOf('day').toUTC()
    } else if (!data && start) {
      return DateTime.fromISO(start).plus({ days: 7 }).endOf('day').toUTC()
    } else {
      return DateTime.now().endOf('day').toUTC()
    }
  }

  getRangeType(data: string, time_range: any) {
    if (data) {
      return time_range[data]
    } else {
      return time_range['DAILY']
    }
  }
}
