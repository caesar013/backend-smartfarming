import BaseService from "App/Base/Services/BaseService"
import FertilizerScheduleRepository from "App/Repositories/FertilizerSchedule/FertilizerScheduleRepository"

export default class FertilizerScheduleService extends BaseService {
  constructor() {
    super(new FertilizerScheduleRepository())
  }
}
