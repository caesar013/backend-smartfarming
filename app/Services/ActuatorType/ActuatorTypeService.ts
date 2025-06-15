import BaseService from "App/Base/Services/BaseService"
import ActuatorTypeRepository from "App/Repositories/ActuatorType/ActuatorTypeRepository"

export default class ActuatorTypeService extends BaseService {
  constructor() {
    super(new ActuatorTypeRepository())
  }
}
    