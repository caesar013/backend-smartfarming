import BaseRepository from "App/Base/Repositories/BaseRepository";
import SensorType from "App/Models/SensorType/SensorType";

export default class SensorTypeRepository extends BaseRepository {
  constructor() {
    super(SensorType)
  }
}
