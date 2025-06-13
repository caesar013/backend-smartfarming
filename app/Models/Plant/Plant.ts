import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import PlantGrowthParameter from './PlantGrowthParameter';
import PlantingBatch from '../PlantingBatch/PlantingBatch';

export default class Plant extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public scientificName: string |  null

  @column()
  public description: string | null

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime | null

  @column.dateTime()
  public deleted_at: DateTime | null

  static get table() {
    return "public.plants" // table name
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

  @hasMany(() => PlantingBatch)
  public plantingBatches: HasMany<typeof PlantingBatch>
}
