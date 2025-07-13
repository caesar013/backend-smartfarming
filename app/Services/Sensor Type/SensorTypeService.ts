import BaseService from "App/Base/Services/BaseService"
import SensorTypeRepository from "App/Repositories/Sensor Type/SensorTypeRepository"

export default class SensorTypeService extends BaseService {
  constructor() {
    super(new SensorTypeRepository())
  }
}
