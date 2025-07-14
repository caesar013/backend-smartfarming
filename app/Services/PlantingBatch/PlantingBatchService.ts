import BaseService from "App/Base/Services/BaseService"
import PlantingBatchRepository from "App/Repositories/PlantingBatch/PlantingBatchRepository"

export default class PlantingBatchService extends BaseService {
  constructor() {
    super(new PlantingBatchRepository())
  }

  /**
   * Service method to get filtered planting batches.
   */
  public async getBatches(options: any) {
    try {
      const results = await this.repository.getFilteredBatches(options)
      return results
    } catch (error) {
      throw error
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
}
