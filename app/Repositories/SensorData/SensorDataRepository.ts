import BaseRepository from "App/Base/Repositories/BaseRepository";
import SensorData from "App/Models/SensorData/SensorData";

export default class SensorDataRepository extends BaseRepository {
  constructor() {
    super(SensorData)
  }
}
    