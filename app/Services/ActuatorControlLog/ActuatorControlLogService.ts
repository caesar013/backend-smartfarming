import BaseService from "App/Base/Services/BaseService"
import ActuatorControlLogRepository from "App/Repositories/ActuatorControlLog/ActuatorControlLogRepository"

export default class ActuatorControlLogService extends BaseService {
  constructor() {
    super(new ActuatorControlLogRepository())
  }
}
    