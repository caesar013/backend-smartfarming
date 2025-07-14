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
}
