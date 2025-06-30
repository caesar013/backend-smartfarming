import BaseRepository from "App/Base/Repositories/BaseRepository";
import Sensor from "App/Models/Sensor/Sensor";

export default class SensorRepository extends BaseRepository {
  constructor() {
    super(Sensor)
  }
}
