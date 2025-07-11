import AutomationLog from 'App/Models/Automation/AutomationLog'

/**
 * AutomationRepository menangani semua interaksi database
 * yang terkait dengan fitur otomasi.
 */
export default class AutomationLogRepository {
  /**
   * Finds all automation logs, with an optional date range filter.
   * @returns A promise that resolves to an array of all AutomationLog instances.
   */
  public async findAll(systemName: string) {
    return await AutomationLog.query()
      .whereHas('automationStatus', (query) => {
        query.where('system', systemName)
      })
      .orderBy('executed_at', 'desc')
  }
}
