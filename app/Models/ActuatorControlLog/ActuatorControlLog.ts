import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Actuator from '../Actuator/Actuator'

export default class ActuatorControlLog extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'actuatorId' })
  public actuatorId: number

  @column()
  public action: string

  @column({ serializeAs: 'triggeredBy' })
  public triggeredBy: string

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  static get table() {
    return "public.actuator_control_logs" // table name
  }

  @belongsTo(() => Actuator)
  public actuator: BelongsTo<typeof Actuator>
}
