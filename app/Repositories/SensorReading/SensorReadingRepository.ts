import Database from "@ioc:Adonis/Lucid/Database";
import BaseRepository from "App/Base/Repositories/BaseRepository";
import Sensor from "App/Models/Sensor/Sensor";
import SensorReading from "App/Models/SensorReading/SensorReading";
import { DateTime } from "luxon";

interface SearchOptions {
  sensors?: string[]
  metrics?: string[]
  interval: 'hour' | 'day'
  startDate: string
  endDate: string
}

export default class SensorReadingRepository extends BaseRepository {
  constructor() {
    super(SensorReading)
  }

  /**
   * Fetches the latest sensor readings.
   * @param sensorId (optional) ID of the sensor to filter readings, if provided
   * @param maxAgeInMinutes (optional) Maximum age of the readings in minutes, if provided
   * @returns
   */
  public async getLatestReadings(sensorId?: number, maxAgeInMinutes?: number) {

    // If sensorId and maxAgeInMinutes are provided, filter readings accordingly
    if (sensorId && maxAgeInMinutes) {
      // Set the earliest timestamp to fetch readings from
      const earliestTimestamp = DateTime.now().minus({ minutes: maxAgeInMinutes }).toUTC()
      console.log(earliestTimestamp.toSQL());

      // Build the query to fetch readings for a specific sensor within the max age limit
      const query = `
        SELECT
          s.id AS sensor_id,
          s.public_name AS name,
          sr.payload,
          sr.created_at AS timestamp
        FROM
          sensors s
        INNER JOIN
          sensor_readings sr ON s.id = sr.sensor_id
        WHERE
          s.id = ? AND
          s.deleted_at IS NULL AND
          sr.created_at >= ?
        ORDER BY
          sr.created_at DESC
        LIMIT 1 -- This ensures we only get the latest reading;
      `
      const { rows } = await Database.rawQuery(query, [sensorId, earliestTimestamp.toSQL()])
      return rows
    }

    const latestReadingQuery = `
      SELECT DISTINCT ON (s.id)
        s.id AS sensor_id,
        s.public_name AS name,
        sr.payload,
        sr.created_at AS timestamp
      FROM
        sensors s
      INNER JOIN
        sensor_readings sr ON s.id = sr.sensor_id
      WHERE
        s.deleted_at IS NULL
      ORDER BY
        s.id, sr.created_at DESC;
    `;
    const { rows } = await Database.rawQuery(latestReadingQuery);
    return rows;
  }

  public async findByPublicName(publicName: string) {
    return Sensor.findBy('public_name', publicName)
  }

  /**
   * Performs a search for aggregated sensor readings.
   * This function is now focused solely on fetching the aggregated data from the database.
   * The transformation/grouping of this data is handled in the Service layer.
   */
  public async search(options: SearchOptions) {
    const bindings: any[] = [];

    // 1. Build SELECT clause for metrics dynamically
    const selectMetrics: string[] = [];
    if (options.metrics && options.metrics.length > 0) {
      for (const metric of options.metrics) {
        // Use ?? for identifiers and ? for values to prevent SQL injection
        selectMetrics.push(`AVG((sr.payload ->> ?)::float) AS ??`);
        bindings.push(metric, metric);
      }
    } else {
      selectMetrics.push(`jsonb_agg(sr.payload) AS payloads`);
    }

    // 2. Build the main query
    // We select the time bucket, sensor name, and the dynamic metrics.
    let query = `
      SELECT
        date_trunc(?, sr.created_at AT TIME ZONE 'Asia/Jakarta') AS time_bucket,
        s.public_name AS sensor_name,
        ${selectMetrics.join(', ')}
      FROM
        sensor_readings sr
      INNER JOIN
        sensors s ON sr.sensor_id = s.id
    `;

    // Add interval to the beginning of bindings for date_trunc
    bindings.unshift(options.interval);

    // 3. Build WHERE clause
    const whereClauses: string[] = [];
    whereClauses.push(`sr.created_at BETWEEN ? AND ?`);
    bindings.push(options.startDate, options.endDate);

    if (options.sensors && options.sensors.length > 0) {
      // Using `unnest` is a good way to handle array parameters in raw queries
      whereClauses.push(`s.public_name = ANY(SELECT unnest(?::text[]))`);
      bindings.push(options.sensors);
    }

    query += ` WHERE ${whereClauses.join(' AND ')}`;

    // 4. GROUP BY and ORDER BY clause
    // Group by the time bucket (index 1) and sensor name (index 2)
    query += `
      GROUP BY 1, 2
      ORDER BY 2, 1;
    `;

    // 5. Execute and return the flat results
    const { rows } = await Database.rawQuery(query, bindings);
    return rows;
  }

  public async fetchSensorMap() {
    const sensors = await Sensor.query().select('id', 'publicName')
      .whereNull('deletedAt')

    return Object.fromEntries(
      sensors.map(sensor => [sensor.publicName, sensor.id])
    )
  }
}
