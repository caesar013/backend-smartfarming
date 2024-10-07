import BaseService from "App/Base/Services/BaseService"
import RelayRepository from "App/Repositories/Relay/RelayRepository"

export default class RelayService extends BaseService {
  constructor() {
    super(new RelayRepository())
  }
}
    