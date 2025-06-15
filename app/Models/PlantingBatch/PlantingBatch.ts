import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, BelongsTo, belongsTo, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Plant from '../Plant/Plant'
import BedLocation from '../BedLocation/BedLocation'

export default class PlantingBatch extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'plantId' })
  public plantId: number

  @column.date({ serializeAs: 'plantingDate' })
  public plantingDate: DateTime

  @column.date({ serializeAs: 'harvestDate' })
  public harvestDate: DateTime

  // turn UTC to Asia/Jakarta timezone
  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt', })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime | null

  @column.dateTime({ serializeAs: 'deletedAt' })
  public deletedAt: DateTime | null

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
