import Database from "@ioc:Adonis/Lucid/Database";
import BaseRepository from "App/Base/Repositories/BaseRepository";
import Relay from "App/Models/Relay/Relay";
import { DateTime } from "luxon";

export default class RelayRepository extends BaseRepository {
  constructor() {
    super(Relay)
  }

  public async get(number: number) {
    return Relay.query().where('number', number).whereNull('disabled_at').first()
  }

  public async create(number: number, state: boolean){
    await Relay.create({ number, currentStatus: state });
  }

  public async update(relay: Relay, state: boolean){
    relay.disabledAt = DateTime.now();
    relay.currentStatus = state;
    await relay.save();
  }

  public async getStatus(){
    const raw = await Database.rawQuery(`
      SELECT r1.*
      FROM relays r1
      INNER JOIN (
          SELECT number, MAX(id) as max_id
          FROM relays
          GROUP BY number
      ) r2 ON r1.number = r2.number AND r1.id = r2.max_id
      ORDER BY r1.id DESC
    `);

    return raw.rows;
  }
}
    