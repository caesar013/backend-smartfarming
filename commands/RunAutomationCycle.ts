import { BaseCommand } from '@adonisjs/core/build/standalone'
import AutomationService from 'App/Services/Automation/AutomationService'
import FuzzyDecisionService from 'App/Services/FuzzyDecision/FuzzyDecisionService'
import PlantParameterService from 'App/Services/PlantParameter/PlantParameterService'
import SensorReadingService from 'App/Services/SensorReading/SensorReadingService'

export default class RunAutomationCycle extends BaseCommand {
  /**
   * Nama perintah untuk dipanggil dari terminal.
   */
  public static commandName = 'automation:run'

  /**
   * Deskripsi perintah yang akan muncul di 'node ace list'.
   */
  public static description = 'Runs a single, complete automation cycle for nutrient control.'

  public static settings = {
    /**
     * Muat aplikasi sebelum menjalankan perintah. Ini penting agar kita bisa
     * menggunakan service dan model dari dalam command ini.
     */
    loadApp: true,
  }

  public async run() {
    this.logger.info('Starting automation cycle via Ace command...')

    // Logika ini sama persis seperti yang ada di AutomationController
    // Kita membuat instance dari semua service yang dibutuhkan
    const plantParameterService = new PlantParameterService()
    const sensorReadingService = new SensorReadingService()
    const fuzzyDecisionService = new FuzzyDecisionService()

    const automationService = new AutomationService(
      plantParameterService,
      sensorReadingService,
      fuzzyDecisionService
    )

    // Jalankan siklus otomasi
    await automationService.automate()

    this.logger.success('Automation cycle finished successfully.')
  }
}
