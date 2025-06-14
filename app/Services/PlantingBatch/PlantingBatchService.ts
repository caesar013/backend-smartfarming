import BaseService from "App/Base/Services/BaseService"
import PlantingBatchRepository from "App/Repositories/PlantingBatch/PlantingBatchRepository"

export default class PlantingBatchService extends BaseService {
  constructor() {
    super(new PlantingBatchRepository())
  }
}
    