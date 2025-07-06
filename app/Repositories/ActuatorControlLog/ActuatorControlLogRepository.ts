import Database from "@ioc:Adonis/Lucid/Database";
import BaseRepository from "App/Base/Repositories/BaseRepository";
import ActuatorControlLog from "App/Models/ActuatorControlLog/ActuatorControlLog";

export interface LogCreationPayload {
  actuatorId: number
  action: string
  triggeredBy: string
  turnOffAt?: string | null // Optional, can be null if not specified
}

export default class ActuatorControlLogRepository extends BaseRepository {
  constructor() {
    super(ActuatorControlLog)
  }

  /**
   * Creates a new actuator control log entry.
   * @param data The data for the new log entry.
   * @returns The newly created ActuatorControlLog instance.
   */
  public async create(data: LogCreationPayload): Promise<ActuatorControlLog> {
    const log = await this.model.create(data)
    return log
  }

  /**
   * Finds all actuator control logs that have an action of 'ON' and are past their turn-off time.
   * This is used to identify commands that should have been turned off but are still active.
   * @returns A list of ActuatorControlLog instances that match the criteria.
   */
  public async findExpiredOnCommands(): Promise<ActuatorControlLog[]> {
    // 1. Use the readable query builder to get plain data objects
    const results = await Database.from('actuator_control_logs as l1')
      .select('l1.*')
      .where('l1.action', 'ON')
      .where(
        'l1.id',
        Database.from('actuator_control_logs as l2')
          .max('l2.id')
          .where('l2.actuator_id', Database.raw('l1.actuator_id'))
          .where('l2.action', 'ON')
      )
      .whereNotExists((builder) => {
        builder
          .from('actuator_control_logs as l3')
          .where('l3.action', 'OFF')
          .whereRaw('l3.actuator_id = l1.actuator_id')
          .whereRaw('l3.created_at > l1.created_at')
      })
      .whereNotNull('l1.turn_off_at')
      .where('l1.turn_off_at', '<', new Date().toISOString());

    // 2. Manually hydrate the plain objects into full model instances
    return results.map(row => {
      // Create a new model instance without calling the constructor
      const logInstance = new ActuatorControlLog()

      // Use .fill() to populate it with the data from the database row
      logInstance.fill(row)

      // Tell Lucid that this model instance represents an existing row in the DB
      logInstance.$isPersisted = true

      return logInstance
    })
  }
}
