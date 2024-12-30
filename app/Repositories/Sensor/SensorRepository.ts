import BaseRepository from "App/Base/Repositories/BaseRepository";
import Sensor from "App/Models/Sensor/Sensor";
import db from '@ioc:Adonis/Lucid/Database'
import { DateTime } from "luxon";
import { NPK } from "App/Enums/NPK";
import { DHT } from "App/Enums/DHT";
import { TABLE } from "App/Enums/TABLE";
import { SENSOR } from "App/Enums/SENSOR";

export default class SensorRepository extends BaseRepository {
  constructor() {
    super(Sensor)
  }

  async getAll(sensor: any, table: any, metric: any, range: any) {
    try {
      return await this.processQuery(sensor, table, metric, range)
    } catch (error) {
      throw error
    }
  }

  async getLatest(table: any) {
    let res: any = {}
    try {
      for (const key of Object.keys(table)) {
        let keys: any = {}, values: any = {}
        if (table[key] === 'dhts') {
          keys = Object.keys(DHT).map(key => key.toLowerCase()) // get keys and convert to lowercase
          values = Object.values(DHT)
        } else if (table[key] === 'npks') {
          keys = Object.keys(NPK).map(key => key.toLowerCase()) // get keys and convert to lowercase
          values = Object.values(NPK)
        } else {
          continue
        }
        res[key.toLowerCase()] = (await this.queryLatest(key.toLowerCase(), table[key], keys, values))[0]
      }
      return res
    } catch (error) {
      throw error
    }
  }

  private async queryLatest(sensor: string, table: string, keys: any, values: any) {
    try {
      const s = await Sensor.findByOrFail('sensor_name', sensor)
      let query = db.query().from(table)
      keys.forEach((key: any, index: number) => {
        if (key === 'read_at') {
          return
        }
        query = query.select(db.raw(`${key} as ${values[index]}`))
      })
      query = query.where('sensor_id', s.id).orderBy('created_at', 'desc').limit(1)
      return await query
    } catch (error) {
      throw error
    }
  }

  private async processQuery(sensor: any, table: any, metric: any, range: any) {
    let res: any = {}
    try {
      for (const key of Object.keys(sensor)) { // loop through sensor keys using for..of to avoid async issue
        res[key.toLowerCase()] = await this.queryBuilder(key.toLowerCase(), table[key], metric[key], range[key])
        // console.log(key.toLowerCase(), table[key], metric[key], range[key])
      }
      return res
    } catch (error) {
      throw error
    }
  }

  private async queryBuilder(sensor: any, table: any, metric: any, range: any) {
    let query = db.query()
    try {
      query = query.from(table)
      query = query.select(db.raw(`date_trunc(\'${range.time_range}\', created_at) as ${range.time_range}`))
      Object.keys(metric).forEach(key => {
        query = query.select(db.raw(`${key.toLowerCase()} as ${metric[key]}`))
      })
      query = query.join(`${this.model.table}`, `${table}.sensor_id`, `${this.model.table}.id`)
      query = query.where('sensor_name', `${sensor}`)
      if (range) {
        query = query.whereBetween('created_at', [range.start, range.end])
      }
      query = query.orderBy(`${range.time_range}`, 'asc')
      return await query
    } catch (error) {
      throw error
    }
  }

  public static async storeData(data: any, sensor_key: any) {
    const sensor = await Sensor.findByOrFail('sensor_name', sensor_key);
    const table = TABLE[sensor_key.toUpperCase()]
    data['sensor_id'] = sensor.id
    data['created_at'] = DateTime.utc()

    try {
      await db.table(table).insert(data)
    } catch (e) {
      console.log('Error inserting data. Message: ', e.message);
    }
  }

  public static async storeDataByRange(range: string) {
    try {
      if (range === 'hourly') {
        await this.getHourlyData()
      } else if (range === 'daily') {
        await this.getDailyData()
      }
    } catch (error) {
      console.log('Error storing data. Message: ', error.message);
    }
  }

  private static async getHourlyData() {
    const start = DateTime.local({ zone: 'Asia/Jakarta' }).minus({ hours: 1 }).startOf('hour').toFormat('yyyy-MM-dd HH:mm:ss')
    const end = DateTime.local({ zone: 'Asia/Jakarta' }).startOf('hour').toFormat('yyyy-MM-dd HH:mm:ss')
    await this.getAverage(start, end, 'hourly')
  }

  private static async getDailyData() {
    const start = DateTime.local({ zone: 'Asia/Jakarta' }).minus({ days: 1 }).startOf('day').toFormat('yyyy-MM-dd HH:mm:ss')
    const end = DateTime.local({ zone: 'Asia/Jakarta' }).startOf('day').toFormat('yyyy-MM-dd HH:mm:ss')
    await this.getAverage(start, end, 'daily')
  }

  private static async getAverage(start: any, end: any, range: string) {
    let data: any = {}
    for (const key of Object.keys(SENSOR)) {
      const sensor = await Sensor.findByOrFail('sensor_name', key.toLowerCase())
      let sensor_key = key + '_' + range.toUpperCase()
      let table_select = TABLE[key]
      let table_insert = TABLE[sensor_key]
      let metrics = sensor.sensor_name === 'dht' ? DHT : NPK
      data = await this.averageQuery(table_select, sensor.id, metrics, start, end)
      await this.storeAveragedData(await this.parseToInt(data), sensor.id, table_insert)
    }
  }

  private static async parseToInt(data: any) {
    let res: any = {}
    Object.keys(data[0]).forEach(key => {
      // parse float to int
      if (key === 'ph') {
        res[key] = parseInt((data[0][key] * 10) + '')
        return
      }
      res[key] = parseInt((data[0][key] * 100) + '')
    })
    return res
  }

  private static async averageQuery(table: string, sensor: number, metrics: any, start: any, end: any) {
    try {
      let query = db.query().from(table)
      Object.keys(metrics).forEach(key => {
        key = key.toLowerCase()
        if (key === 'read_at') {
          return
        }
        query = query.select(db.raw(`avg(${key}) as ${key}`))
      })
      query = query.where('sensor_id', sensor)
      query = query.whereBetween('read_at', [start, end])
      return await query
    } catch (error) {
      throw error
    }
  }

  private static async storeAveragedData(data: any, sensor_id: number, table: any) {
    data['sensor_id'] = sensor_id
    data['created_at'] = DateTime.utc()

    try {
      await db.table(table).insert(data)
    } catch (e) {
      console.log('Error inserting data. Message: ', e.message);
    }
  }

}
