import BaseService from "App/Base/Services/BaseService"
import DataNpkRepository from "App/Repositories/DataNpk/DataNpkRepository"

export default class DataNpkService extends BaseService {
  constructor() {
    super(new DataNpkRepository())
  }
}
    