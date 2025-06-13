import BaseService from "App/Base/Services/BaseService"
import BedLocationRepository from "App/Repositories/BedLocation/BedLocationRepository"

export default class BedLocationService extends BaseService {
  constructor() {
    super(new BedLocationRepository())
  }
}
    