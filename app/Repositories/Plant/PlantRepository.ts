import BaseRepository from "App/Base/Repositories/BaseRepository";
import Plant from "App/Models/Plant/Plant";

export default class PlantRepository extends BaseRepository {
  constructor() {
    super(Plant)
  }
}
    