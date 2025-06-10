import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Actuator from '../Actuator/Actuator'

export default class ActuatorType extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public type: string

  @column()
  public description: string | null

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime | null

  @column.dateTime()
  public deleted_at: DateTime | null

  static get table() {
    return "actuator_types" // table name
  }

  @beforeFind()
  public static findWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @beforeFetch()
  public static fetchWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @hasMany(() => Actuator)
  public actuators: HasMany<typeof Actuator>;
}
