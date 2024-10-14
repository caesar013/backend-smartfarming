import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Sensor from '../Sensor/Sensor'

export default class DataNpk extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column({
    serializeAs: 'temp',
    serialize: (value: number | null) => {
      return value ? value / 100 : value
    }
  })
  public temperature: number

  @column({
    serializeAs: 'hum',
    serialize: (value: number | null) => {
      return value ? value / 100 : value
    }
  })
  public humidity: number

  @column({
    serializeAs: 'cond',
    serialize: (value: number | null) => {
      return value ? value / 100 : value
    }
  })
  public conductivity: number

  @column({
    serializeAs: 'ph',
  })
  public ph: number

  @column({
    serializeAs: 'Nitrogen',
  })
  public nitrogen: number

  @column({
    serializeAs: 'Phosphorus',
  })
  public phosphorus: number

  @column({
    serializeAs: 'Pottasium',
  })
  public potassium: number

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  static get table() {
    return "public.data_npk" // table name
  }

  // belongs to one sensor
  @belongsTo(() => Sensor, {
    foreignKey: 'sensor_id',
  })
  public sensor: BelongsTo<typeof Sensor>
}
