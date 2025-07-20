import BaseRepository from "App/Base/Repositories/BaseRepository";
import Location from "App/Models/Location/Location";

export default class LocationRepository extends BaseRepository {
  constructor() {
    super(Location)
  }
}
