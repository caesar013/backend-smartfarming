import AutomationLogRepository from "App/Repositories/AutomationLog/AutomationLogRepository"

export default class AutomationLogService {
  private automationLogRepository: AutomationLogRepository

  constructor() {
    this.automationLogRepository = new AutomationLogRepository()
  }

  /**
    * Retrieves automation logs for a specific system, with optional date filtering.
    * @param systemName - The name of the system.
    * @param startDate - The start date for the filter.
    * @param endDate - The end date for the filter.
    * @returns A promise that resolves to an array of formatted automation logs.
    */
  public async getAllLogs(systemName: string, startDate?: string, endDate?: string) {
    // Teruskan parameter ke repository
    const rows = await this.automationLogRepository.findAll(systemName, startDate, endDate)

    if (rows.length === 0) {
      // Pesan error bisa disesuaikan jika ada filter tanggal
      const message =
        startDate && endDate
          ? `Tidak ada log ditemukan untuk sistem: ${systemName} antara ${startDate} dan ${endDate}`
          : `Tidak ada log ditemukan untuk sistem: ${systemName}`
      throw new Error(message)
    }

    return rows.map((row) => {
      const plainLog = row.toJSON()
      const { payloadInput, automationStatusId, ...rest } = plainLog
      return {
        ...rest,
        ...(payloadInput || {}),
      }
    })
  }
}
