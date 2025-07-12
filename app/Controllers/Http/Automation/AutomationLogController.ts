import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import AutomationLogService from 'App/Services/AutomationLog/AutomationLogService'

export default class AutomationLogController {
  private automationLogService: AutomationLogService

  constructor() {
    this.automationLogService = new AutomationLogService()
  }
  /**
   * Retrieves all automation logs.
   */
  public async index({ params, response }: HttpContextContract) {
    try {
      const systemName = params.system.toUpperCase()
      const result = await this.automationLogService.getAllLogs(systemName)
      return response.ok({ logs: result })
    } catch (error) {
      if (error.messages) {
        return response.badRequest({ errors: error.messages })
      }
      Logger.error(`Gagal mengambil log untuk [${params.system}]: %j`, error.messages)
      return response.internalServerError({
        message: 'Terjadi kesalahan internal saat mengambil riwayat log.',
      })
    }
  }
}
