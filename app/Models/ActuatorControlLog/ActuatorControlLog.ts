import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Actuator from '../Actuator/Actuator'

export default class ActuatorControlLog extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public actuatorId: number

  @column()
  public command: string

  @column()
  public commandOrigin: string | null

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  static get table() {
    return "actuator_control_logs" // table name
  }

  @belongsTo(() => Actuator)
  public actuator: BelongsTo<typeof Actuator>
}
