import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import { schema } from '@ioc:Adonis/Core/Validator'
import AutomationIrrigationLog from 'App/Models/Automation/AutomationIrrigationLog'

export default class AutomationLogsController {
  /**
   * Mengambil SEMUA riwayat log otomatisasi.
   * Respons sekarang hanya berisi { data: [...] } tanpa pagination.
   * Method ini dipanggil oleh route: GET /api/automation/logs
   */
  public async index({ request, response }: HttpContextContract) {
    const validatorSchema = schema.create({
      start_date: schema.date.optional({ format: 'yyyy-MM-dd' }),
      end_date: schema.date.optional({ format: 'yyyy-MM-dd' }),
    })
    try {
      // Validasi query params yang masuk
      const payload = await request.validate({
        schema: validatorSchema,
        data: request.qs(),
      })
      const startDate = payload.start_date
      let endDate = payload.end_date

      // Logika untuk query database
      const query = AutomationIrrigationLog.query().orderBy('executed_at', 'desc')

      // Menambahkan kondisi WHERE secara dinamis
      if (startDate) {
        // Cari log yang waktu eksekusinya lebih dari atau sama dengan 'startDate'
        query.where('executed_at', '>=', startDate.toSQL()!)
      }

      if (endDate) {
        // Untuk endDate ambil sampai akhir hari (23:59:59)
        const endOfDay = endDate.endOf('day')
        // Cari log yang waktu eksekusinya KURANG DARI atau SAMA DENGAN end_date
        query.where('executed_at', '<=', endOfDay.toSQL()!)
      }
      // Eksekusi query
      const logs = await query.exec()
      return response.ok({ data: logs })
    } catch (error) {
      Logger.error('Gagal mengambil riwayat log otomatisasi: %j', error)
      return response.internalServerError({
        message: 'Terjadi kesalahan internal saat mengambil riwayat log.',
      })
    }
  }
}
