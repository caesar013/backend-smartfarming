import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Plant from './Plant'
import GrowthStage from './GrowthStage'

export default class PlantGrowthNpk extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public plantId: number

  @column()
  public growthStageId: number

  @column()
  public minAge: number

  @column()
  public maxAge: number

  @column()
  public minN: number

  @column()
  public maxN: number

  @column()
  public minP: number

  @column()
  public maxP: number

  @column()
  public minK: number

  @column()
  public maxK: number


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deleted_at: DateTime

  static get table() {
    return "plant_growth_npks" // table name
  }

  @beforeFind()
  public static findWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @beforeFetch()
  public static fetchWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @belongsTo(() => Plant, {
    foreignKey: 'plantId',
  })
  public plant: BelongsTo<typeof Plant>

  @belongsTo(() => GrowthStage, {
    foreignKey: 'growthStageId',
  })
  public growthStage: BelongsTo<typeof GrowthStage>
}
