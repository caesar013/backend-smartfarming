import BaseService from "App/Base/Services/BaseService"
import DataDhtRepository from "App/Repositories/DataDht/DataDhtRepository"

export default class DataDhtService extends BaseService {
  constructor() {
    super(new DataDhtRepository())
  }
}
    