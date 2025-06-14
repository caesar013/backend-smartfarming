import BaseRepository from "App/Base/Repositories/BaseRepository";
import ActuatorControlLog from "App/Models/ActuatorControlLog/ActuatorControlLog";

export default class ActuatorControlLogRepository extends BaseRepository {
  constructor() {
    super(ActuatorControlLog)
  }
}
    