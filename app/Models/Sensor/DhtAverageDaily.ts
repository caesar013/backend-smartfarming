import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Sensor from './Sensor'

export default class DhtAverageDaily extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public temperature: number

  @column()
  public humidity: number

  @column()
  public luminosity: number

  @column()
  public sensorID: number

  @belongsTo(() => Sensor, {
    foreignKey: 'sensorID',
  })
  public sensor: BelongsTo<typeof Sensor>

  @column.dateTime()
  public createdAt: DateTime

  static get table() {
    return 'dht_average_dailies'
  }
}
