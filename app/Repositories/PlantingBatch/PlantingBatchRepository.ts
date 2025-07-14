import BaseRepository from "App/Base/Repositories/BaseRepository";
import PlantingBatch from "App/Models/PlantingBatch/PlantingBatch";

export default class PlantingBatchRepository extends BaseRepository {
  constructor() {
    super(PlantingBatch)
  }

  /**
   * Fetches planting batches, with an optional filter for the plant.
   * It also preloads the related plant and location data for each batch.
   */
  public async getFilteredBatches(options: any) {
    const { pagination, filter } = options
    const query = PlantingBatch.query()

    // 1. Eager load relationships
    // .preload('locations') is essential to get the many-to-many data
    query.preload('plant').preload('locations')

    // 2. Apply optional filter
    if (filter?.plantId) {
      query.where('plantId', filter.plantId)
    }

    // 3. Default sorting
    query.orderBy('plantingDate', 'desc')

    // 4. Apply pagination
    if (pagination?.page && pagination?.limit) {
      return query.paginate(pagination.page, pagination.limit)
    }

    return query
  }
}
