import Database from "@ioc:Adonis/Lucid/Database";
import BaseRepository from "App/Base/Repositories/BaseRepository";
import Actuator from "App/Models/Actuator/Actuator";

export default class ActuatorRepository extends BaseRepository {
  constructor() {
    super(Actuator)
  }

  /**
   * Finds a record by its ID or throws a custom exception if not found.
   * @param slug The slug of the record.
   * @returns The Actuator model instance.
   */
  public async findOrFail(slug: string): Promise<Actuator> {
    const record = this.find(slug)
    if (!record) {
      throw new Error(`Actuator named ${slug} was not found.`)
    }
    return record as unknown as Actuator
  }

  /**
   * Finds a record by its ID.
   * @param id The ID of the record.
   * @returns The Actuator model instance or null.
   */
  public async find(slug: string): Promise<Actuator | null> {
    return await Actuator.findByOrFail('slug', slug)
  }

  /**
   * Gets a list of all actuators and joins them with their last known status
   * from the control logs table.
   */
  public async getLatestStatusOfAll() {
    // This query has been updated to select only the fields needed by the frontend,
    // hiding sensitive or unnecessary information like relay_pin and type_id.
    const query = `
      SELECT
          a.name,
          COALESCE(log.action, 'OFF') AS "currentStatus",
          log.created_at AS "lastChangedAt",
          log.triggered_by AS "lastTriggeredBy"
      FROM
          public.actuators a
      LEFT JOIN
          (
              -- This subquery finds the single latest log entry for each actuator
              SELECT
                  l1.actuator_id,
                  l1.action,
                  l1.created_at,
                  l1.triggered_by
              FROM
                  public.actuator_control_logs l1
              INNER JOIN
                  (
                      SELECT
                          actuator_id,
                          MAX(id) AS max_id
                      FROM
                          public.actuator_control_logs
                      GROUP BY
                          actuator_id
                  ) l2 ON l1.actuator_id = l2.actuator_id AND l1.id = l2.max_id
          ) log ON a.id = log.actuator_id
      WHERE
          a.deleted_at IS NULL
      ORDER BY
          a.id ASC;
    `
    const result = await Database.rawQuery(query)

    // .rows will contain the clean array of objects
    return result.rows
  }
}
