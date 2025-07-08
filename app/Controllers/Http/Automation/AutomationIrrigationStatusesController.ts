import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AutomationStatus from 'App/Models/Automation/AutomationIrrigationStatus'
import { schema } from '@ioc:Adonis/Core/Validator'
import Logger from '@ioc:Adonis/Core/Logger'

export default class AutomationStatusesController {
  /**
   * Method untuk MENDAPATKAN status otomatisasi saat ini.
   * Dipanggil oleh: GET /api/automation/status
   */
  public async getStatus({ response }: HttpContextContract) {
    try {
      // Ambil baris pertama dari tabel status, atau buat baru jika tidak ada.
      const status = await AutomationStatus.firstOrCreate({}, { isActive: false })

      return response.ok({
        is_active: status.isActive,
        updated_at: status.updatedAt,
      })
    } catch (error) {
      Logger.error('Gagal mengambil status otomatisasi: %j', error)
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil status otomatisasi.',
      })
    }
  }

  /**
   * Method untuk MENGUBAH status otomatisasi.
   * Dipanggil oleh: POST /api/automation/status
   */
  public async setStatus({ request, response }: HttpContextContract) {
    const statusSchema = schema.create({
      is_active: schema.boolean(),
    })

    try {
      const payload = await request.validate({ schema: statusSchema })

      // Cari baris status, atau buat baru jika tidak ada, lalu update.
      const status = await AutomationStatus.updateOrCreate(
        {},
        { isActive: payload.is_active }
      )

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
