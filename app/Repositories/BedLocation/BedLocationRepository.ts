import BaseRepository from "App/Base/Repositories/BaseRepository";
import BedLocation from "App/Models/BedLocation/BedLocation";

export default class BedLocationRepository extends BaseRepository {
  constructor() {
    super(BedLocation)
  }
}
    