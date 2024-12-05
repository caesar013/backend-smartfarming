import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Sensor from './Sensor'

export default class NpkAverageDaily extends BaseModel {
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
  public sensorId: number

  @belongsTo(() => Sensor, {
    foreignKey: 'sensorId',
  })
    public sensor: BelongsTo<typeof Sensor>

  @column.dateTime()
  public createdAt: DateTime
}
