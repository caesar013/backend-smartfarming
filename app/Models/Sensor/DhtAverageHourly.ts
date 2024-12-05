import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Sensor from './Sensor'

export default class DhtAverageHourly extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public temperature: number

  @column()
  public humidity: number

  @column()
  public luminosity: number

  @column.dateTime()
  public createdAt: DateTime

  @column()
  public sensorId: number

  @belongsTo(() => Sensor, {
    foreignKey: 'sensorId',
  })
  public sensor: BelongsTo<typeof Sensor>

  static get table() {
    return 'dht_average_hourlies' // table name
  }
}
