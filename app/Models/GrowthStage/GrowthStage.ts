import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import PlantGrowthParameter from '../PlantGrowthParameter/PlantGrowthParameter';


export default class GrowthStage extends BaseModel {
  public static softDelete = true;

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public order: number

  @column()
  public description: string | null

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime | null

  @column.dateTime({ serializeAs: 'deletedAt' })
  public deletedAt: DateTime | null

  static get table() {
    return "public.growth_stages" // table name
  }

  @beforeFind()
  public static findWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @beforeFetch()
  public static fetchWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @hasMany(() => PlantGrowthParameter)
  public plantGrowthParameters: HasMany<typeof PlantGrowthParameter>
}
