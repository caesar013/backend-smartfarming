import BaseService from "App/Base/Services/BaseService"
import PlantGrowthParameterRepository from "App/Repositories/PlantGrowthParameter/PlantGrowthParameterRepository"

export default class PlantGrowthParameterService extends BaseService {
  constructor() {
    super(new PlantGrowthParameterRepository())
  }
}
    