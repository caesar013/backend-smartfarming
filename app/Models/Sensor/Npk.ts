import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Sensor from 'App/Models/Sensor/Sensor'

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
  public potassium: number

  @column()
  public sensor_id: number

  @column.dateTime()
  public readAt: DateTime

  @belongsTo(() => Sensor, {
    foreignKey: 'sensor_id',
  })
  public sensor: BelongsTo<typeof Sensor>

  @column.dateTime()
  public created_at: DateTime

  static get table() {
    return "public.npks" // table name
  }
}
