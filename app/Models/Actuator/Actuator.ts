import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import ActuatorType from '../ActuatorType/ActuatorType'
import BedLocation from '../BedLocation/BedLocation'
import ActuatorControlLog from '../ActuatorControlLog/ActuatorControlLog'

export default class Actuator extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public actuatorTypeId: number | null

  @column()
  public bedLocationId: number | null

  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime | null

  @column.dateTime()
  public deleted_at: DateTime | null

  static get table() {
    return "actuators" // table name
  }

  @beforeFind()
  public static findWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @beforeFetch()
  public static fetchWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @belongsTo(() => ActuatorType)
  public actuatorType: BelongsTo<typeof ActuatorType>

  @belongsTo(() => BedLocation)
  public bedLocation: BelongsTo<typeof BedLocation>

  @hasMany(() => ActuatorControlLog)
  public actuatorControlLogs: HasMany<typeof ActuatorControlLog>
}
