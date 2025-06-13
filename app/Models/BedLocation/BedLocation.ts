import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, column, HasMany, hasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Actuator from '../Actuator/Actuator'
import PlantingBatch from '../PlantingBatch/PlantingBatch'
import Sensor from '../Sensor/Sensor'

export default class BedLocation extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string | null

  @column()
  public address: string | null

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime | null

  @column.dateTime()
  public deleted_at: DateTime | null

  static get table() {
    return "public.bed_locations" // table name
  }

  @beforeFind()
  public static findWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @beforeFetch()
  public static fetchWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @manyToMany(() => PlantingBatch, {
    pivotTable: 'batch_locations',
    pivotColumns: ['created_at', 'updated_at'],
  })
    public plantingBatches: ManyToMany<typeof PlantingBatch>

  @hasMany(() => Sensor)
  public sensors: HasMany<typeof Sensor>

  @hasMany(() => Actuator)
  public actuators: HasMany<typeof Actuator>
}
