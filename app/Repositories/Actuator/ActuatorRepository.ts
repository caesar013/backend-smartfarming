import BaseRepository from "App/Base/Repositories/BaseRepository";
import Actuator from "App/Models/Actuator/Actuator";

export default class ActuatorRepository extends BaseRepository {
  constructor() {
    super(Actuator)
  }
}
    