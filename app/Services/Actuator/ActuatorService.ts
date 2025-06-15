import BaseService from "App/Base/Services/BaseService"
import ActuatorRepository from "App/Repositories/Actuator/ActuatorRepository"

export default class ActuatorService extends BaseService {
  constructor() {
    super(new ActuatorRepository())
  }
}
    