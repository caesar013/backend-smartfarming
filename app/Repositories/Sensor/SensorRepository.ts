import BaseRepository from "App/Base/Repositories/BaseRepository";
import Sensor from "App/Models/Sensor/Sensor";
import db from '@ioc:Adonis/Lucid/Database'
import { DateTime } from "luxon";
import { NPK } from "App/Enums/NPK";
import { DHT } from "App/Enums/DHT";
import { TABLE } from "App/Enums/TABLE";
import Npk from "App/Models/Sensor/Npk";
import Dht from "App/Models/Sensor/Dht";

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
        }
        res[key.toLowerCase()] = await this.queryLatest(key.toLowerCase(), table[key], keys, values)
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
        query = query.select(db.raw(`avg(${key.toLowerCase()}) as ${metric[key]}`))
      })
      query = query.join(`${this.model.table}`, `${table}.sensor_id`, `${this.model.table}.id`)
      query = query.where('sensor_name', `${sensor}`)
      if (range) {
        query = query.whereBetween('created_at', [range.start, range.end])
      }
      query = query.groupByRaw(`date_trunc(\'${range.time_range}\', created_at)`)
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
    data['createdAt'] = DateTime.utc()

    try {
      if (table === TABLE.NPK_1.toLowerCase()) {
        const npk = await Npk.create(data)
        console.log('Data inserted: ', npk);
      } else if (table === TABLE.DHT.toLowerCase()) {
        const dht = await Dht.create(data)
        console.log('Data inserted: ', dht);
      }
    } catch (e) {
      console.log('Error inserting data. Message: ', e.message);
    }
  }
}
