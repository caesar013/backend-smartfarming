import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Sensor from '../Sensor/Sensor'

export default class SensorReading extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public id: number | string // BIGSERIAL type, can be a number or string in JS

  @column()
  public sensorId: number

  @column({
    prepare: (value: object) => JSON.stringify(value), // Convert object to JSON string for storage
    consume: (value: string) => JSON.parse(value), // Parse JSON string back to object when retrieved
  })
  public payload: object // JSONB type, stored as a string in JS

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime()
  public read_at: DateTime | null

  static get table() {
    return "public.sensor_readings" // table name
  }

  @belongsTo(() => Sensor)
  public sensor: BelongsTo<typeof Sensor>
}
