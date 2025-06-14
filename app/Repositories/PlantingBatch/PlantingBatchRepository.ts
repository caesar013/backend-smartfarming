import BaseRepository from "App/Base/Repositories/BaseRepository";
import PlantingBatch from "App/Models/PlantingBatch/PlantingBatch";

export default class PlantingBatchRepository extends BaseRepository {
  constructor() {
    super(PlantingBatch)
  }
}
    