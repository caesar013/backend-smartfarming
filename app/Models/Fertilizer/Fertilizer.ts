import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import FertilizerSchedule from '../FertilizerSchedule/FertilizerSchedule'

export default class Fertilizer extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column({ columnName: 'n_percentage', serializeAs: 'nPercentage' }) // mapping to n_percentage column
  public nPercentage: number | null

  @column({ columnName: 'p_percentage', serializeAs: 'pPercentage' }) // mapping to p_percentage column
  public pPercentage: number | null

  @column({ columnName: 'k_percentage', serializeAs: 'kPercentage' }) // mapping to k_percentage column
  public kPercentage: number | null

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime | null

  @column.dateTime({ serializeAs: 'deletedAt' })
  public deletedAt: DateTime | null

  static get table() {
    return "public.fertilizers" // table name
  }

  @beforeFind()
  public static findWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @beforeFetch()
  public static fetchWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @hasMany(() => FertilizerSchedule)
  public fertilizerSchedules: HasMany<typeof FertilizerSchedule>
}
