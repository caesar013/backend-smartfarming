import BaseService from "App/Base/Services/BaseService"
import ActuatorControlLogRepository from "App/Repositories/ActuatorControlLog/ActuatorControlLogRepository"

export default class ActuatorControlLogService extends BaseService {
  constructor() {
    super(new ActuatorControlLogRepository())
  }

  /**
   * Orchestrates fetching of filtered actuator logs.
   */
  public async getLogs(options: any) {
    try {
      // The filter object will be passed directly from the controller
      const results = await this.repository.getFilteredLogs(options)
      return results
    } catch (error) {
      throw error
    }
  }
}
