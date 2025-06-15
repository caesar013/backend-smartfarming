import BaseService from "App/Base/Services/BaseService"
import GrowthStageRepository from "App/Repositories/GrowthStage/GrowthStageRepository"

export default class GrowthStageService extends BaseService {
  constructor() {
    super(new GrowthStageRepository())
  }
}
    