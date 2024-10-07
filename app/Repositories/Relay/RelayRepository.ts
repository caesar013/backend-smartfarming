import BaseRepository from "App/Base/Repositories/BaseRepository";
import Relay from "App/Models/Relay/Relay";

export default class RelayRepository extends BaseRepository {
  constructor() {
    super(Relay)
  }
}
    