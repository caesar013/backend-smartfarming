import BaseService from "App/Base/Services/BaseService"
import SensorRepository from "App/Repositories/Sensor/SensorRepository"

export default class SensorService extends BaseService {
  constructor() {
    super(new SensorRepository())
  }
}
