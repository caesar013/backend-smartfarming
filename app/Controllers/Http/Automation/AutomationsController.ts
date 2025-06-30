import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AutomationService from 'App/Services/Automation/AutomationService'
import PlantParameterService from 'App/Services/PlantParameter/PlantParameterService'
import SensorReadingService from 'App/Services/SensorReading/SensorReadingService'

export default class AutomationController {
  public async run({ response }: HttpContextContract) {
    // Buat instance dari semua service yang dibutuhkan
    const plantParameterService = new PlantParameterService()
    const sensorReadingService = new SensorReadingService()
    const automationService = new AutomationService(plantParameterService, sensorReadingService)

    // Jalankan siklus otomasi
    await automationService.automate()

    return response.ok({ message: 'Siklus otomasi telah dijalankan. Cek console log Anda.' })
  }
}
