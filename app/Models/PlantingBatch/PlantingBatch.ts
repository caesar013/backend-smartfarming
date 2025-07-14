import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, BelongsTo, belongsTo, column, computed, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
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

  /**
   * Computed property to dynamically determine the current growth phase
   * using preloaded growth parameter data.
   */
  @computed()
  public get phase(): string {
    // Priority 1: Check if harvested
    if (this.harvestDate) {
      return 'Harvested';
    }

    // Check if the necessary relationships were loaded to prevent errors
    if (!this.plant?.$preloaded.plantGrowthParameters) {
      return 'Calculating...'; // Or 'Unknown'
    }

    // Calculate the current age of the batch in days
    const daysSincePlanting = Math.floor(DateTime.now().diff(this.plantingDate, 'days').days);

    // Find the correct growth parameter from the preloaded array
    const currentParameter = this.plant.plantGrowthParameters.find(param => {
      const isAfterMin = daysSincePlanting >= param.minAge;
      const isBeforeMax = param.maxAge === null || daysSincePlanting <= param.maxAge;
      return isAfterMin && isBeforeMax;
    });

    // Return the stage name if found, otherwise a default
    return currentParameter?.growthStage?.name || 'Uncategorized';
  }

  @belongsTo(() => Plant)
  public plant: BelongsTo<typeof Plant>

  @manyToMany(() => BedLocation, {
    pivotTable: 'batch_locations',
  })
  public locations: ManyToMany<typeof BedLocation>
}
