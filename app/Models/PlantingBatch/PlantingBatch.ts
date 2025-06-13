import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, BelongsTo, belongsTo, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Plant from '../Plant/Plant'
import BedLocation from '../BedLocation/BedLocation'

export default class PlantingBatch extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public plantId: number

  @column.date()
  public plantingDate: DateTime

  @column.date()
  public harvestDate: DateTime

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime | null

  @column.dateTime()
  public deleted_at: DateTime | null

  static get table() {
    return "public.planting_batches" // table name
  }

  @beforeFind()
  public static findWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @beforeFetch()
  public static fetchWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @belongsTo(() => Plant)
  public plant: BelongsTo<typeof Plant>

  @manyToMany(() => BedLocation, {
    pivotTable: 'batch_locations',
  })
  public locations: ManyToMany<typeof BedLocation>
}
