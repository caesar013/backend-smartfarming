import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FuzzyIrrigationService, { IrrigationFuzzyInputs, KondisiCuaca } from 'App/Services/FuzzyDecision/FuzzyIrrigationService'

export default class IrrigationFuzzyController {
  private fuzzyIrrigationService: FuzzyIrrigationService

  constructor() {
    this.fuzzyIrrigationService = new FuzzyIrrigationService()
  }

  /**
   * Dry-run perhitungan fuzzy irigasi.
   * Endpoint ini hanya menghitung durasi, tidak mengirim perintah ke aktuator/MQTT.
   */
  public async calculate({ request, response }: HttpContextContract) {
    const suhuTanah = Number(request.input('suhuTanah', request.input('suhu_tanah')))
    const kelembapanTanah = Number(request.input('kelembapanTanah', request.input('kelembapan_tanah')))
    const cuaca = request.input('cuaca', 'Cerah') as KondisiCuaca

    if (!Number.isFinite(suhuTanah)) {
      return response.badRequest({ message: 'suhuTanah wajib berupa angka.' })
    }

    if (!Number.isFinite(kelembapanTanah)) {
      return response.badRequest({ message: 'kelembapanTanah wajib berupa angka.' })
    }

    if (cuaca !== 'Cerah' && cuaca !== 'Hujan') {
      return response.badRequest({ message: 'cuaca wajib bernilai Cerah atau Hujan.' })
    }

    const inputs: IrrigationFuzzyInputs = {
      suhuTanah,
      kelembapanTanah,
      cuaca,
    }

    const calculation = this.fuzzyIrrigationService.calculateIrrigationDetail(inputs)

    return response.ok({
      message: 'Dry-run fuzzy irigasi berhasil dihitung. Tidak ada aktuator yang dijalankan.',
      ...calculation,
    })
  }
}
