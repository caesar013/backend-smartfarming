import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, column } from '@ioc:Adonis/Lucid/Orm'

export default class PlantGrowthParameter extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: string

  @column({ serializeAs: 'plantId'})
  public plantId: number

  @column({ serializeAs: 'growthStageId' })
  public growthStageId: number

  @column({ serializeAs: 'minAge' })
  public minAge: number

  @column({ serializeAs: 'maxAge' })
  public maxAge: number | null

  @column({ serializeAs: 'minN' })
  public minN: number

  @column({ serializeAs: 'maxN' })
  public maxN: number | null

  @column({ serializeAs: 'minP' })
  public minP: number

  @column({ serializeAs: 'maxP' })
  public maxP: number | null

  @column({ serializeAs: 'minK' })
  public minK: number

  @column({ serializeAs: 'maxK' })
  public maxK: number | null

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime | null

  @column.dateTime({ serializeAs: 'deletedAt' })
  public deletedAt: DateTime | null

  static get table() {
    return "public.plant_growth_parameters" // table name
  }

  @beforeFind()
  public static findWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @beforeFetch()
  public static fetchWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }
}
