import BaseService from "App/Base/Services/BaseService"
import LocationRepository from "App/Repositories/Location/LocationRepository"

export default class LocationService extends BaseService {
  constructor() {
    super(new LocationRepository())
  }
}
