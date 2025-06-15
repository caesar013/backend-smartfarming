import BaseRepository from "App/Base/Repositories/BaseRepository";
import GrowthStage from "App/Models/GrowthStage/GrowthStage";

export default class GrowthStageRepository extends BaseRepository {
  constructor() {
    super(GrowthStage)
  }
}
