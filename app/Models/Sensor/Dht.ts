import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import Sensor from 'App/Models/Sensor/Sensor'

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

  @belongsTo(() => Sensor, {
    foreignKey: 'sensor_id',
  })
  public sensor: BelongsTo<typeof Sensor>

  @column()
  public createdAt: DateTime

  static get table() {
    return "public.dhts" // table name
  }
}
