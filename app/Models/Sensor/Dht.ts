import { DateTime } from 'luxon'
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Sensor from './Sensor'

export default class Dht extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public temperature: number
  
  @column()
  public humidity: number

  @column()
  public luminosity: number

  @column()
  public sensor_id: number

  @hasOne(() => Sensor)
  public sensor: HasOne<typeof Sensor>

  @column()
  public createdAt: DateTime

  static get table() {
    return "public.dhts" // table name
  }
}
