import BaseRepository from "App/Base/Repositories/BaseRepository";
import DataDht from "App/Models/DataDht/DataDht";

export default class DataDhtRepository extends BaseRepository {
  constructor() {
    super(DataDht)
  }
}
    