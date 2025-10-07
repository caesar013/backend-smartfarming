import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Plant from '../Plant/Plant'
import GrowthStage from '../GrowthStage/GrowthStage'

export default class PlantGrowthParameter extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'plantId'})
  public plantId: number

  @column({ serializeAs: 'growthStageId' })
  public growthStageId: number

  @column({ serializeAs: 'minAge' })
  public minAge: number

  @column({ serializeAs: 'maxAge' })
  public maxAge: number | null

  @column({ serializeAs: 'minSoilEc' })
  public minSoilEc: number

  @column({ serializeAs: 'maxSoilEc' })
  public maxSoilEc: number | null

  @column({ serializeAs: 'minSoilHumidity' })
  public minSoilHumidity: number

  @column({ serializeAs: 'maxSoilHumidity' })
  public maxSoilHumidity: number | null

  @column({ serializeAs: 'minPh' })
  public minPh: number

  @column({ serializeAs: 'maxPh' })
  public maxPh: number | null

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

  @belongsTo(() => Plant)
  public plant: BelongsTo<typeof Plant>

  @belongsTo(() => GrowthStage)
  public growthStage: BelongsTo<typeof GrowthStage>
}
