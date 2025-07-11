import AutomationLogRepository from "App/Repositories/AutomationLog/AutomationLogRepository"

export default class AutomationLogService {
  private automationLogRepository: AutomationLogRepository

  constructor() {
    this.automationLogRepository = new AutomationLogRepository()
  }

  /**
   * Retrieves all automation logs for a specific system.
   * @param systemName - The name of the system to filter logs by.
   * @returns A promise that resolves to an array of automation logs.
   */
  public async getAllLogs(systemName: string) {
    const rows = await this.automationLogRepository.findAll(systemName)

    if (rows.length === 0) {
      throw new Error(`Tidak ada log ditemukan untuk sistem: ${systemName}`)
    }

    return rows.map((row) => {
      const plainLog = row.toJSON()

      const { payloadInput, automationStatusId, ...rest } = plainLog

      return {
        ...rest,
        ...(payloadInput || {}), // Spread the payloadInput properties directly into the log object
      }
    })
  }
}
