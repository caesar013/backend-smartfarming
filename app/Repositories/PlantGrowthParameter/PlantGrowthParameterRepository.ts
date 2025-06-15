import BaseRepository from "App/Base/Repositories/BaseRepository";
import PlantGrowthParameter from "App/Models/PlantGrowthParameter/PlantGrowthParameter";

export default class PlantGrowthParameterRepository extends BaseRepository {
  constructor() {
    super(PlantGrowthParameter)
  }
}
    