import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import AutomationLogService from 'App/Services/AutomationLog/AutomationLogService'

export default class AutomationLogController {
  private automationLogService: AutomationLogService

  constructor() {
    this.automationLogService = new AutomationLogService()
  }
  /**
    * Retrieves all automation logs with optional date filtering.
    */
  public async index({ params, request, response }: HttpContextContract) {
    try {
      const systemName = params.system.toUpperCase()
      // Ambil startDate dan endDate dari query string URL
      const { startDate, endDate } = request.qs()

      const result = await this.automationLogService.getAllLogs(systemName, startDate, endDate)
      return response.ok({ logs: result })
    } catch (error) {
      // Tangani error jika log tidak ditemukan
      if (error.message.includes('Tidak ada log ditemukan')) {
        return response.notFound({ message: error.message })
      }

      if (error.messages) {
        return response.badRequest({ errors: error.messages })
      }

      Logger.error(`Gagal mengambil log untuk [${params.system}]: %j`, error)
      return response.internalServerError({
        message: 'Terjadi kesalahan internal saat mengambil riwayat log.',
      })
    }
  }
}
