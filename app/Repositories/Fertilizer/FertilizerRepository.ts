import BaseRepository from "App/Base/Repositories/BaseRepository";
import Fertilizer from "App/Models/Fertilizer/Fertilizer";

export default class FertilizerRepository extends BaseRepository {
  constructor() {
    super(Fertilizer)
  }
}
