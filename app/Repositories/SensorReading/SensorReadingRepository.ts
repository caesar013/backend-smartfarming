import Database from "@ioc:Adonis/Lucid/Database";
import BaseRepository from "App/Base/Repositories/BaseRepository";
import SensorReading from "App/Models/SensorReading/SensorReading";

export default class SensorReadingRepository extends BaseRepository {
  constructor() {
    super(SensorReading)
  }

  public async getLatestReadings() {
    const latestReadingQuery = `
        SELECT DISTINCT ON (s.id)
        s.id as sensor_id,
        s.name as name,
        sr.payload,
        sr.created_at as timestamp
      FROM
        sensors s
      INNER JOIN
        sensor_readings sr ON s.id = sr.sensor_id
      ORDER BY
        s.id, sr.created_at DESC;
    `
    const { rows } = await Database.rawQuery(latestReadingQuery)
    return rows
  }
}
