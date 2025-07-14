import AutomationLog from 'App/Models/Automation/AutomationLog'

/**
 * AutomationRepository menangani semua interaksi database
 * yang terkait dengan fitur otomasi.
 */
export default class AutomationLogRepository {
  /**
   * Finds all automation logs, with optional date filtering.
   * @param systemName - The name of the system (e.g., 'PINTU_AIR')
   * @param startDate - The start date for the filter (e.g., '2025-07-10')
   * @param endDate - The end date for the filter (e.g., '2025-07-15')
   */
  public async findAll(systemName: string, startDate?: string, endDate?: string) {
    const query = AutomationLog.query()
      .preload('automationStatus', (automationStatusQuery) => {
        automationStatusQuery.where('system', systemName)
      })
      .preload('automationStatus')
      .whereHas('automationStatus', (automationStatusQuery) => {
        automationStatusQuery.where('system', systemName)
      })

    // Tambahkan filter tanggal HANYA JIKA startDate dan endDate disediakan
    if (startDate && endDate) {
      // Pastikan endDate mencakup keseluruhan hari tersebut
      const adjustedEndDate = `${endDate} 23:59:59`
      query.whereBetween('executed_at', [startDate, adjustedEndDate])
    }

    // Urutkan berdasarkan yang terbaru
    query.orderBy('executed_at', 'desc')

    return await query
  }
}
