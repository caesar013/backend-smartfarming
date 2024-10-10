import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Sensor from './Sensor'

export default class Npk extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public temperature: number
  
  @column()
  public humidity: number
  
  @column()
  public conductivity: number
  
  @column()
  public ph: number
  
  @column()
  public nitrogen: number
  
  @column()
  public phosphorus: number
  
  @column()
  public pottasium: number
  
  @column()
  public sensor_id: number

  @hasOne(() => Sensor)
  public sensor: HasOne<typeof Sensor>
  
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  static get table() {
    return "public.npks" // table name
  }
}
