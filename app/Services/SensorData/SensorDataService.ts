import BaseService from "App/Base/Services/BaseService"
import SensorDataRepository from "App/Repositories/SensorData/SensorDataRepository"

export default class SensorDataService extends BaseService {
  constructor() {
    super(new SensorDataRepository())
  }
}
    