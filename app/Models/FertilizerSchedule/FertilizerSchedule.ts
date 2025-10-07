import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Fertilizer from '../Fertilizer/Fertilizer'

export default class FertilizerSchedule extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'plant_growth_parameter_id', serializeAs: 'plantGrowthParameterId' })
  public plantGrowthParameterId: number

  @column({ columnName: 'fertilizer_id', serializeAs: 'fertilizerId' })
  public fertilizerId: number

  @column({ columnName: 'day_of_application', serializeAs: 'dayOfApplication' })
  public dayOfApplication: number

  @column()
  public amount: number

  @column()
  public unit: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Fertilizer)
  public fertilizer: BelongsTo<typeof Fertilizer>
}
