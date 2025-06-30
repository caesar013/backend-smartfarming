import BaseRepository from "App/Base/Repositories/BaseRepository";
import ActuatorControlLog from "App/Models/ActuatorControlLog/ActuatorControlLog";

interface LogCreationPayload {
  actuatorId: number
  action: string
  triggeredBy: string
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
}
