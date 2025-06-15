import BaseService from "App/Base/Services/BaseService"
import PlantRepository from "App/Repositories/Plant/PlantRepository"

export default class PlantService extends BaseService {
  constructor() {
    super(new PlantRepository())
  }
}
    