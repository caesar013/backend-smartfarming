import Database from "@ioc:Adonis/Lucid/Database";
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

  /**
   * Creates a PlantingBatch and attaches its locations within a database transaction.
   * @param batchData The data for the PlantingBatch model.
   * @param locationIds An array of IDs for the bed locations.
   */
  public async createWithLocations(batchData: object, locationIds: number[]) {
    // Start a transaction
    const trx = await Database.transaction()
    try {
      // 1. Create the main PlantingBatch record using the transaction client
      const batch = await PlantingBatch.create(batchData, { client: trx })

      // 2. Attach the location IDs to the pivot table using the transaction client
      await batch.related('locations').attach(locationIds, trx)

      // 3. If everything is successful, commit the transaction
      await trx.commit()

      // We need to load the relations to return them in the response
      await batch.load('locations')
      await batch.load('plant')

      return batch
    } catch (error) {
      // If any step fails, roll back the entire transaction
      await trx.rollback()
      throw error // Re-throw the error to be handled by the controller
    }
  }

  /**
   * Updates a PlantingBatch and syncs its locations within a database transaction.
   * @param id The ID of the batch to update.
   * @param payload The data to update, including an optional `locations` array.
   */
  public async updateWithLocations(id: number, payload: any) {
    const { locations: locationIds, ...batchData } = payload
    const trx = await Database.transaction()

    try {
      // 1. Find the batch record
      const batch = await PlantingBatch.find(id, { client: trx })
      if (!batch) {
        await trx.rollback()
        return null // Not found
      }

      // 2. Update the main batch data
      batch.merge(batchData)
      await batch.save() // This saves the changes within the transaction

      // 3. If locationIds were provided, sync them.
      // .sync() will add/remove relations to match the array.
      if (locationIds) {
        await batch.related('locations').sync(locationIds, true, trx) // Pass trx here
      }

      // 4. Commit the transaction
      await trx.commit()

      // Load relations to return the updated state
      await batch.load('locations')
      await batch.load('plant')

      return batch
    } catch (error) {
      // If any step fails, roll back all changes
      await trx.rollback()
      throw error
    }
  }
}
