import BaseRepository from "App/Base/Repositories/BaseRepository";
import FertilizerSchedule from "App/Models/FertilizerSchedule/FertilizerSchedule";

export default class FertilizerScheduleRepository extends BaseRepository {
  constructor() {
    super(FertilizerSchedule)
  }
}
