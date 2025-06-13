import BaseRepository from "App/Base/Repositories/BaseRepository";
import ActuatorType from "App/Models/ActuatorType/ActuatorType";

export default class ActuatorTypeRepository extends BaseRepository {
  constructor() {
    super(ActuatorType)
  }
}
    