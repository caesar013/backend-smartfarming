import BaseService from "App/Base/Services/BaseService"
import FertilizerSchedule from "App/Models/FertilizerSchedule/FertilizerSchedule"
import PlantingBatch from "App/Models/PlantingBatch/PlantingBatch"
import PlantingBatchRepository from "App/Repositories/PlantingBatch/PlantingBatchRepository"
import { DateTime } from "luxon"

export default class PlantingBatchService extends BaseService {
  constructor() {
    super(new PlantingBatchRepository())
  }

  /**
   * Service method to get filtered planting batches.
   */
  public async getBatches(options: any): Promise<{ meta: any; data: any[] }> {
    // 1. Get the paginator instance from the repository
    const paginator = await this.repository.getFilteredBatches(options)

    // 2. Enrich each batch in the current page with its dailyStatus
    const enrichedData = await this._enrichBatchesWithDailyStatus(paginator.all())

    // 3. Create a new paginator with the enriched data but keep the original meta
    return {
      meta: paginator.toJSON().meta,
      data: enrichedData,
    }
  }

  /**
   * Creates a new planting batch and associates it with locations.
   */
  public async createBatch(payload: any) {
    try {
      // Destructure the payload to separate locations from the main data
      const { locations, ...batchData } = payload

      // Call the new repository method
      const result = await this.repository.createWithLocations(batchData, locations)
      return result
    } catch (error) {
      throw error
    }
  }

  /**
   * Updates a planting batch and syncs its locations.
   */
  public async updateBatch(id: number, payload: any) {
    try {
      const result = await this.repository.updateWithLocations(id, payload)
      return result
    } catch (error) {
      throw error
    }
  }

  /**
   * Takes an array of batch models and returns a new array of plain objects,
   * each enriched with its calculated dailyStatus.
   * @private
   */
  private async _enrichBatchesWithDailyStatus(batches: PlantingBatch[]) {
    // Create an array of promises, one for each batch
    const enrichmentPromises = batches.map((batch) => this._calculateDailyStatus(batch))

    // Wait for all promises to resolve
    const dailyStatuses = await Promise.all(enrichmentPromises)

    // Combine the original batch data with the newly calculated statuses
    return batches.map((batch, index) => {
      return {
        ...batch.toJSON(), // Convert the original batch model to a plain object
        dailyStatus: dailyStatuses[index], // Add the corresponding status
      }
    })
  }

  /**
   * Calculates the daily status for a SINGLE batch instance.
   * This function contains the core logic.
   * @private
   */
  private async _calculateDailyStatus(batch: PlantingBatch) {
    const age = Math.floor(DateTime.now().diff(batch.plantingDate, 'days').days)

    const currentParameter = batch.plant.plantGrowthParameters.find((param) => {
      const isAfterMin = age >= param.minAge
      const isBeforeMax = param.maxAge === null || age <= param.maxAge
      return isAfterMin && isBeforeMax
    })

    let todaysTasks: FertilizerSchedule[] = []
    if (currentParameter) {
      todaysTasks = await FertilizerSchedule.query()
        .where('plant_growth_parameter_id', currentParameter.id)
        .where('day_of_application', age)
        .preload('fertilizer')
    }

    return {
      age: age,
      stageName: currentParameter?.growthStage?.name || 'Uncategorized',
      tasks: todaysTasks,
    }
  }
}
