import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import PlantingBatch from './PlantingBatch/PlantingBatch'
import BedLocation from './BedLocation/BedLocation'
import AutomationIrrigationLog from './Automation/AutomationIrrigationLog'
export default class BatchLocation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'plantingBatchId' })
  public plantingBatchId: number

  @column({ serializeAs: 'bedLocationId' })
  public bedLocationId: number

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime | null

  static get table() {
    return 'public.batch_locations' // table name
  }

  // Define relationships here if needed
  @belongsTo(() => PlantingBatch)
  public plantingBatch: BelongsTo<typeof PlantingBatch>

  @belongsTo(() => BedLocation)
  public bedLocation: BelongsTo<typeof BedLocation>

  @hasMany(() => AutomationIrrigationLog)
  public automationLogs: HasMany<typeof AutomationIrrigationLog>
}
