import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Sensor from '../Sensor/Sensor'

export default class DataDht extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public temperature: number

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  static get table() {
    return "public.data_dht" // table name
  }

  // belongs to one sensor
  @belongsTo(() => Sensor, {
    foreignKey: 'sensor_id',
  })
  public sensor: BelongsTo<typeof Sensor>
}
