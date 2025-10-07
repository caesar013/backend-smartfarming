import BaseService from "App/Base/Services/BaseService"
import FertilizerRepository from "App/Repositories/Fertilizer/FertilizerRepository"

export default class FertilizerService extends BaseService {
  constructor() {
    super(new FertilizerRepository())
  }
}
