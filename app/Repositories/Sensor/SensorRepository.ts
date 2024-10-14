import BaseRepository from "App/Base/Repositories/BaseRepository";
import Sensor from "App/Models/Sensor/Sensor";
import db from '@ioc:Adonis/Lucid/Database'
import Dht from "App/Models/Sensor/Dht";
import Npk from "App/Models/Sensor/Npk";
import { DateTime } from "luxon";

export default class SensorRepository extends BaseRepository {
  constructor() {
    super(Sensor)
  }

  async getAll(sensor: any, table: any, metric: any, range: any) {
    try {
      const res = await this.processQuery(sensor, table, metric, range)
      return res
    } catch (error) {
      throw error
    }
  }

  async processQuery(sensor: any, table: any, metric: any, range: any) {
    let res: any = {}
    try {
      for (const key of Object.keys(sensor)) {
        res[key] = await this.queryBuilder(sensor[key], table[key], metric[key], range[key])
      }
      return res
    } catch (error) {
      throw error
    }
  }

  async queryBuilder(sensor: any, table: any, metric: any, range: any) {
    let query = db.query()
    try {
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
    } catch (error) {
      throw error
    }
  }

    static draft = {
        npk_1: [] as any,
        npk_2: [] as any,
        dht: [] as any
    }

    public static async storeNpk(data: any, type: string){
        const sensor = await Sensor.findByOrFail('sensor_name', type);

        if(DateTime.now().minute % 10 != 0){
            this.draft[type.replace('-', '_')].push(data);
        } else {
            try {
                const totalEntries = this.draft[type.replace('-', '_')].length;

                const averages = this.draft[type.replace('-', '_')].reduce((acc: any, curr: any) => {
                    acc.conductivity += curr.conductivity / totalEntries;
                    acc.temperature += curr.temperature / totalEntries;
                    acc.humidity += curr.humidity / totalEntries;
                    acc.ph += curr.ph / totalEntries;
                    acc.nitrogen += curr.nitrogen / totalEntries;
                    acc.phosphorus += curr.phosphorus / totalEntries;
                    acc.pottasium += curr.pottasium / totalEntries;
                    return acc;
                }, { conductivity: 0, temperature: 0, humidity: 0, ph: 0, nitrogen: 0, phosphorus: 0, pottasium: 0 });

                await Npk.create({
                    temperature: parseInt(String(averages.temperature * 100)),
                    humidity: parseInt(String(averages.humidity * 100)),
                    conductivity: parseInt(String(averages.conductivity * 100)),
                    ph: parseInt(String(averages.ph * 100)),
                    nitrogen: parseInt(String(averages.nitrogen * 100)),
                    phosphorus: parseInt(String(averages.phosphorus * 100)),
                    pottasium: parseInt(String(averages.pottasium * 100)),
                    sensor_id: sensor.id,
                    createdAt: DateTime.now().set({ minute: 0, second: 0, millisecond: 0 })
                });
                this.draft[type.replace('-', '_')] = [];
            } catch (e) {
                console.log('Error insertting npk data. Message: ', e.message);
            }
        }
        
    }

    public static async storeDht(data: any){
        const sensor = await Sensor.findByOrFail('sensor_name', 'dht');

        if(DateTime.now().minute % 10 != 0){
            this.draft['dht'].push(data);
        } else {
            const totalEntries = this.draft['dht'].length;
            const averages = this.draft['dht'].reduce((acc: any, curr: any) => {
                acc.lux += curr.lux / totalEntries;
                acc.temperature += curr.temperature / totalEntries;
                acc.humidity += curr.humidity / totalEntries;
                return acc;
            }, { lux: 0, temperature: 0, humidity: 0 });

            try {
                await Dht.create({
                    
                    temperature: parseInt(String(averages.temperature * 100)),
                    humidity: parseInt(String(averages.humidity * 100)),
                    luminosity: parseInt(String(averages.lux * 100)),
                    sensor_id: sensor.id,
                    createdAt: DateTime.now().set({ minute: 0, second: 0, millisecond: 0 })
                });
                this.draft['dht'] = [];
            } catch (e) {
                console.log('Error insertting dht data. Message: ', e.message);
            }
        }
        
    }
}