import BaseRepository from "App/Base/Repositories/BaseRepository";
import DataNpk from "App/Models/DataNpk/DataNpk";

export default class DataNpkRepository extends BaseRepository {
  constructor() {
    super(DataNpk)
  }
}
    