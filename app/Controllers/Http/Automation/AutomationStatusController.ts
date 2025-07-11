import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AutomationStatusService from 'App/Services/AutomationStatus/AutomationStatusService'
import Logger from '@ioc:Adonis/Core/Logger'
import AutomationStatusValidator from 'App/Validators/AutomationStatus/AutomationStatusValidator'

export default class AutomationStatusController {
  private automationStatusService: AutomationStatusService

  constructor() {
    this.automationStatusService = new AutomationStatusService()
  }

  /**
   * Method to get the current automation status.
   * This method retrieves the status of a system by its name.
   */
  public async getStatus({ params, response }: HttpContextContract) {
    try {
      const systemName = params.system.toUpperCase()
      const result = await this.automationStatusService.getStatus(systemName)
      return result
    } catch (error) {
      Logger.error('Gagal mengambil status otomatisasi: %j', error)
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil status otomatisasi.',
      })
    }
  }

  /**
   * Method to set the automation status.
   * This method updates the status of a system by its name.
   *
   */
  public async setStatus({ params, request, response }: HttpContextContract) {
    try {
      // Validate request body using AutomationStatusValidator.
      const payload = await request.validate(AutomationStatusValidator)

      // Get automation system name from the request.
      const systemName = params.system.toUpperCase()

      // Update the automation status using the service.
      const status = await this.automationStatusService.setStatus(systemName, payload.isActive)

      Logger.info(`Status otomatisasi diubah menjadi: ${status.isActive}`)
      return response.ok({
        message: 'Status otomatisasi berhasil diperbarui.',
        data: {
          is_active: status.isActive,
        },
      })
    } catch (error) {
      if (error.messages) {
        return response.badRequest({ errors: error.messages })
      }
      Logger.error('Gagal memperbarui status otomatisasi: %j', error)
      return response.internalServerError({
        message: 'Terjadi kesalahan saat memperbarui status otomatisasi.',
      })
    }
  }
}
