// commands/RunIrrigationCycle.ts

// Perubahan utama ada di baris import ini
import { BaseCommand } from '@adonisjs/core/build/standalone'
import AutomationService from 'App/Services/Automation/AutomationService'

// Impor semua service yang dibutuhkan oleh constructor AutomationService
import PlantParameterService from "App/Services/PlantParameter/PlantParameterService"
import SensorReadingService from "App/Services/SensorReading/SensorReadingService"
import FuzzyDecisionService from "App/Services/FuzzyDecision/FuzzyDecisionService"
import FuzzyIrrigationService from "App/Services/FuzzyDecision/FuzzyIrrigationService"
import ActuatorService from "App/Services/Actuator/ActuatorService"

export default class RunIrrigationCycle extends BaseCommand {
  public static commandName = 'automation:run-irrigation'
  public static description = 'Menjalankan satu siklus otomasi lengkap untuk IRIGASI.'

  public static settings = {
    loadApp: true,
  }

  public async run() {
    // Properti 'this.logger' sekarang akan dikenali dengan benar
    this.logger.info('Memulai siklus otomasi IRIGASI melalui Ace command...')

    try {
      const plantParameterService = new PlantParameterService()
      const sensorReadingService = new SensorReadingService()
      const fuzzyDecisionService = new FuzzyDecisionService()
      const fuzzyIrrigationService = new FuzzyIrrigationService()
      const actuatorService = new ActuatorService()

      // 2. Buat instance dari service utama, dengan menyuntikkan semua dependensinya
      const automationService = new AutomationService(
        plantParameterService,
        sensorReadingService,
        fuzzyDecisionService,
        fuzzyIrrigationService,
        actuatorService
      )

      // 3. Jalankan siklus otomasi IRIGASI
      await automationService.automateIrrigation()

      this.logger.success('Siklus otomasi IRIGASI telah selesai.')
    } catch (error) {
      this.logger.error('Terjadi kesalahan saat menjalankan siklus otomasi irigasi.')
      // Menggunakan error.stack akan memberikan lebih banyak detail saat debugging
      this.logger.error(error.stack)
    }
  }
}
