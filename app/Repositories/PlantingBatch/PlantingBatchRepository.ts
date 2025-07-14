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

    // 1. Eager load the entire relationship chain needed for the 'phase' calculation
    query
      .preload('locations') // For the locations list
      .preload('plant', (plantQuery) => { // Load the batch's plant...
        plantQuery.preload('plantGrowthParameters', (pgpQuery) => { // ...then the plant's growth parameters...
          pgpQuery.preload('growthStage'); // ...and finally the growth stage name for each parameter.
        });
      });

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
