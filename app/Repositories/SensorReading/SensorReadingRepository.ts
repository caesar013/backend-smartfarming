import Database from "@ioc:Adonis/Lucid/Database";
import BaseRepository from "App/Base/Repositories/BaseRepository";
import Sensor from "App/Models/Sensor/Sensor";
import SensorReading from "App/Models/SensorReading/SensorReading";

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

  public async findByPublicName(publicName: string) {
    return Sensor.findBy('public_name', publicName)
  }

  public async search(options: SearchOptions) {
    const bindings: any[] = []

    // ---- 1. Build the SELECT clause dynamically ----
    const selectMetrics: string[] = []
    if (options.metrics && options.metrics.length > 0) {
      options.metrics.forEach((metric) => {
        // For each metric, create an AVG() expression.
        // The ::numeric cast is crucial for AVG to work on JSONB text values.
        selectMetrics.push(`AVG((sr.payload ->> ?)::numeric) AS ??`)
        bindings.push(metric, metric) // Add metric name twice for binding
      })
    } else {
      // Default: select the entire payload if no specific metrics are requested
      // Note: AVG cannot be used here, so we take the first payload in the group.
      selectMetrics.push(`(array_agg(sr.payload ORDER BY sr.created_at))[1] as payload`)
    }

    // ---- 2. Build the full Query String ----
    let query = `
      SELECT
        date_trunc(?, sr.created_at AT TIME ZONE 'Asia/Jakarta') as time_bucket,
        s.public_name as sensor_name,
        ${selectMetrics.join(', ')}
      FROM
        sensor_readings sr
      INNER JOIN
        sensors s ON sr.sensor_id = s.id
    `
    bindings.unshift(options.interval) // Add interval ('hour' or 'day') to the start of bindings

    // ---- 3. Build the WHERE clause dynamically ----
    const whereClauses: string[] = []
    // Date range is always applied
    whereClauses.push(`sr.created_at BETWEEN ? AND ?`)
    bindings.push(options.startDate, options.endDate)

    // Sensor filter is optional
    if (options.sensors && options.sensors.length > 0) {
      // Use 'unnest' for array binding in raw queries
      whereClauses.push(`s.public_name = ANY(?)`)
      // whereClauses.push(`s.public_name IN (?)`)
      bindings.push(options.sensors)
    }

    query += ` WHERE ${whereClauses.join(' AND ')}`

    // ---- 4. Add GROUP BY and ORDER BY ----
    query += `
      GROUP BY
        time_bucket,
        sensor_name
      ORDER BY
        sensor_name,
        time_bucket;
    `

    // ---- 5. Execute the query ----
    const { rows } = await Database.rawQuery(query, bindings)
    return rows
  }

  public async fetchSensorMap() {
    const sensors = await Sensor.query().select('id', 'publicName')
      .whereNull('deletedAt')

    return Object.fromEntries(
      sensors.map(sensor => [sensor.publicName, sensor.id])
    )
  }
}
