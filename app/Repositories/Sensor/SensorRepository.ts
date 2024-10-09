import BaseRepository from "App/Base/Repositories/BaseRepository";
import Sensor from "App/Models/Sensor/Sensor";
import db from '@ioc:Adonis/Lucid/Database'

export default class SensorRepository extends BaseRepository {
  constructor() {
    super(Sensor)
  }

  async getAll(sensor: any, table: any, metric: any, range: any) {
    try {
      // return {
      //   sensor: sensor,
      //   table: table,
      //   metric: metric,
      // }
      const res = await this.processQuery(sensor, table, metric, range)
      return res
    } catch (error) {
      throw error
    }
  }

  async processQuery(sensor: any, table: any, metric: any, range: any) {
    let res: any = {}
    for (const key of Object.keys(sensor)) {
      res[key] = await this.queryBuilder(sensor[key], table[key], metric[key], range[key])
    }
    return res
  }

  async queryBuilder(sensor: any, table: any, metric: any, range: any) {
    let query = db.query()
    query = query.from(table)
    query = query.select(db.raw(`date_trunc(\'${range.time_range}\', created_at) as ${range.time_range}`))
    Object.keys(metric).forEach(key => {
      query = query.select(db.raw(`avg(${metric[key]}) as ${key}_avg`))
    })
    query = query.join(`${this.model.table}`, `${table}.sensor_id`, `${this.model.table}.id`)
    query = query.where('sensor_name', sensor)
    if (range) {
      query = query.whereBetween('created_at', [range.start, range.end])
    }
    query = query.groupByRaw(`date_trunc(\'${range.time_range}\', created_at)`)
    query = query.orderBy(`${range.time_range}`, 'asc')
    return await query
  }
}
