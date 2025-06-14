import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import ActuatorType from '../ActuatorType/ActuatorType'
import BedLocation from '../BedLocation/BedLocation'
import ActuatorControlLog from '../ActuatorControlLog/ActuatorControlLog'

export default class Actuator extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'actuatorTypeId' })
  public actuatorTypeId: number

  @column({ serializeAs: 'bedLocationId' })
  public bedLocationId: number | null

  @column()
  public name: string

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime | null

  @column.dateTime({ serializeAs: 'deletedAt' })
  public deletedAt: DateTime | null

  static get table() {
    return "public.actuators" // table name
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
  public location: BelongsTo<typeof BedLocation>

  @hasMany(() => ActuatorControlLog)
  public logs: HasMany<typeof ActuatorControlLog>
}
