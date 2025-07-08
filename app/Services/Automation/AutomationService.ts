import PlantParameterService from "App/Services/PlantParameter/PlantParameterService"
import SensorReadingService from "../SensorReading/SensorReadingService"
import FuzzyDecisionService from "../FuzzyDecision/FuzzyDecisionService"
import ActuatorService from "../Actuator/ActuatorService"
import BatchLocation from "App/Models/BatchLocation"
import { DateTime } from "luxon"
import Logger from '@ioc:Adonis/Core/Logger'
import FuzzyIrrigationService from "App/Services/FuzzyDecision/FuzzyIrrigationService"
import AutomationIrrigationStatus from "App/Models/Automation/AutomationIrrigationStatus"
import AutomationIrrigationLog from "App/Models/Automation/AutomationIrrigationLog"

interface dhtContract {
  viciHumidity: number
  viciLuminosity: number
  viciTemperature: number
}
export default class AutomationService {
  private static isRunningIrrigation: boolean = false
  // Initialize required services
  constructor(
    private plantParameterService: PlantParameterService,
    private sensorReadingService: SensorReadingService,
    private fuzzyDecisionService: FuzzyDecisionService, // for nutrition
    private fuzzyIrrigationService: FuzzyIrrigationService, // for irrigation
    private actuatorService: ActuatorService
  ) { }

  PUMP_LATENCY_SECONDS = 15
  PUMP_ACTUATOR_SLUG = 'pump'
  NUTRIENT_VALVE_SLUG = 'nutrient-valve'
  WATER_VALVE_SLUG = 'water-valve'
  /**
   * Main automation function that orchestrates the entire process
   * @returns {Promise<void>}
   */
  public async automate() {
    console.log('--- GLOBAL AUTOMATION CYCLE BEGINS ---')

    // 1. Get all batch locations and preload the data we need.
    // This complex query prevents multiple database calls inside a loop.
    const allBatchLocations = await BatchLocation.query()
      .whereHas('plantingBatch', (batchQuery) => {
        batchQuery.whereNull('harvest_date')
      })
      .preload('plantingBatch', (batchQuery) => {
        batchQuery.preload('plant')
      })
      .preload('bedLocation', (bedQuery) => {
        bedQuery
          .preload('sensors', (sensorQuery) => {
            // Only preload sensors where the related type has a specific code.
            sensorQuery.whereHas('sensorType', (typeQuery) => {
              typeQuery.where('type_code', 'NPK') // <-- Find by type, not name!
            })
          })
          .preload('actuators')
      })

    console.log(`Found ${allBatchLocations.length} batch locations to process.`)
    // 2. Loop through each one and process it.
    for (const batchLocation of allBatchLocations) {
      // We check if all necessary data was loaded before processing.
      if (batchLocation.plantingBatch && batchLocation.bedLocation && batchLocation.bedLocation.sensors && batchLocation.bedLocation.actuators) {
        await this.processSingleBatchLocation(batchLocation)
      } else {
        console.warn(`Skipping a batch location due to incomplete data.`)
      }
    }

    console.log('--- GLOBAL AUTOMATION CYCLE ENDED ---')
  }
  /**
    * Fungsi otomasi utama untuk IRIGASI.
    * DIUBAH untuk mencari sensor yang benar dan menggunakan syarat yang benar.
    */
  public async automateIrrigation() {
    // Mengambil status irrigasi
    const statusRecord = await AutomationIrrigationStatus.firstOrCreate({}, { isActive: false })
    const isIrrigationEnabled = statusRecord.isActive

    // Pengecekan apakah fitur irigasi menyala
    if (!isIrrigationEnabled) {
      Logger.info('[IRRIGATION_AUTOMATION] Irrigation automation feature is OFF. Stopping process.')
      return
    }

    // Pengecekan apakah automasi sedang dijalankan saat ini
    if (AutomationService.isRunningIrrigation) {
      Logger.info('[IRRIGATION_AUTOMATION] Irrigation automation is in process. Stopping process.')
      return
    }
    try {
      AutomationService.isRunningIrrigation = true
      Logger.info('--- GLOBAL IRRIGATION AUTOMATION CYCLE BEGINS ---')
      const allBatchLocations = await BatchLocation.query()
        .whereHas('plantingBatch', (batchQuery) => {
          batchQuery.whereNull('harvest_date')
            .whereHas('plant', ($plant) => {
              // this will only get group bed which has strawberry on it.
              // adjustments in future is needed
              $plant.where('name', 'Stroberi')
            })
        })
        .whereHas('bedLocation', ($groupBed) => {
          // this will only get group bed 2 as intended in the thesis
          // adjustments in future is heavily suggested.
          $groupBed.where('id', 2)
        })
        .preload('bedLocation', (bedQuery) => {
          bedQuery
            .preload('sensors', (sensorQuery) => {
              sensorQuery.whereHas('sensorType', (typeQuery) => {
                typeQuery.where('type_code', 'NPK')
              }).preload('sensorType')
            })
        })
      // this line will only get dht data ONLY, will need future improvements
      const dhtReadings = (await this.sensorReadingService.getLatestReadings())['dht']

      Logger.info(`Found ${allBatchLocations.length} active batch locations for irrigation.`)

      for (const batchLocation of allBatchLocations) {
        // =========================================================================================
        // --- LOGGING TAMBAHAN UNTUK DEBUGGING ---
        // =========================================================================================
        const locationName = batchLocation.bedLocation?.name || 'Unknown';
        const sensorCount = batchLocation.bedLocation?.sensors.length || 0;
        Logger.info(`[DEBUG] Checking Location: '${locationName}'. Found Sensors: ${sensorCount}`);
        // =========================================================================================

        if (batchLocation.bedLocation && sensorCount >= 1) {
          await this.processSingleLocationForIrrigation(batchLocation, dhtReadings)
        } else {
          Logger.warn(`Skipping irrigation for location ${locationName} due to incomplete data (sensors or actuators).`)
        }
      }

      Logger.info('--- GLOBAL IRRIGATION AUTOMATION CYCLE ENDED ---')
    } catch (error) {
      Logger.error(`Terjadi error : ${error.message}`)
    } finally {
      AutomationService.isRunningIrrigation = false
    }

  }

  /**
     * Memproses logika irigasi untuk satu BatchLocation,
     * dari membaca sensor hingga menyimpan log.
     */
  private async processSingleLocationForIrrigation(batchLocation: BatchLocation, dhtReadings: dhtContract) {
    const plotName = batchLocation.bedLocation.name;
    Logger.info(`\n--- [IRRIGATION] Processing Plot: ${plotName} ---`);

    // --- 1. Ambil Data Sensor ---
    const npkSensor = batchLocation.bedLocation.sensors.find(s => s.sensorType.typeCode === 'NPK');
    let suhuUdara: number | undefined;
    let kelembapanTanah: number | undefined;

    try {
      const npkLatestReadingsResponse = await this.sensorReadingService.getLatestReadings(npkSensor?.id, 60);
      if (npkSensor) {
        suhuUdara = dhtReadings.viciTemperature;
        kelembapanTanah = npkLatestReadingsResponse.soilHumidity;
        Logger.info(`[IRRIGATION] Reading from sensor '${npkSensor.name}', Humidity: ${kelembapanTanah}. DHT sensor, Temp: ${suhuUdara},`);
      }
    } catch (error) {
      Logger.error(`[IRRIGATION] Failed to get or parse sensor readings for plot ${plotName}. Error: ${error.message}`);
      return; // Hentikan proses untuk lokasi ini jika sensor gagal dibaca
    }

    // --- 2. Validasi Data Sensor ---
    if (suhuUdara === undefined || kelembapanTanah === undefined) {
      Logger.warn(`[IRRIGATION] Critical sensor data (temp/humidity) is null or missing for plot ${plotName}. Skipping.`);
      return;
    }

    // --- 3. Hitung Keputusan menggunakan Fuzzy Logic ---
    const effectiveDuration = this.fuzzyIrrigationService.calculateIrrigationDuration({
      suhuUdara: suhuUdara,
      kelembapanTanah: kelembapanTanah,
    });

    // --- 4. Simpan Log Keputusan ke Database ---
    try {
      await AutomationIrrigationLog.create({
        batchLocationId: batchLocation.id,
        dhtTemperatureInput: suhuUdara,
        npkHumidityInput: kelembapanTanah,
        state: effectiveDuration > 0 ? 'Menyiram' : 'Tidak Menyiram',
        duration: Math.round(effectiveDuration),
      });
      Logger.info(`[LOG] Automation decision for plot '${plotName}' has been logged to the database.`);
    } catch (dbError) {
      // Jika logging gagal, proses irigasi tetap lanjut.
      // Kita hanya mencatat errornya agar tidak mengganggu fungsi utama.
      Logger.error(`[LOG] Failed to write automation log to database: ${dbError.message}`);
    }

    // --- 5. Eksekusi Aksi (Nyalakan Aktuator) ---
    let totalPumpDuration = 0;
    if (effectiveDuration > 0) {
      totalPumpDuration = Math.round(effectiveDuration + this.PUMP_LATENCY_SECONDS);
    }

    Logger.info(`[IRRIGATION] Decision for ${plotName}: Effective Duration=${effectiveDuration}s, Total Duration=${totalPumpDuration}s`);

    if (totalPumpDuration > 0) {
      Logger.info(`[AKTUATOR] Starting irrigation cycle for '${this.PUMP_ACTUATOR_SLUG}', '${this.WATER_VALVE_SLUG}'`);
      await this.sendCommandWithRetry(this.WATER_VALVE_SLUG, 'ON');
      const pumpTurnOnSuccess = await this.sendCommandWithRetry(this.PUMP_ACTUATOR_SLUG, 'ON');

      if (pumpTurnOnSuccess) {
        Logger.info(`[AKTUATOR] Pump and Valve is ON. Waiting for ${totalPumpDuration} seconds...`);
        await new Promise(resolve => setTimeout(resolve, totalPumpDuration * 1000));

        Logger.info(`[AKTUATOR] Time is up. Turning OFF pump and valve.`);
        await this.sendCommandWithRetry(this.PUMP_ACTUATOR_SLUG, 'OFF');
        await this.sendCommandWithRetry(this.WATER_VALVE_SLUG, 'OFF');
      } else {
        Logger.error(`[AKTUATOR] Failed to turn on pump and valve. Aborting irrigation cycle for plot ${plotName}.`);
      }
    } else {
      Logger.info('[AKTUATOR] No irrigation needed.');
    }

    Logger.info(`--- [IRRIGATION] Cycle for Plot: ${plotName} finished ---`);
  }


  /**
   * Processes the automation logic for a single BatchLocation.
   */
  private async processSingleBatchLocation(batchLocation: BatchLocation) {

    // The array should only contain NPK sensors because of our filter.
    const npkSensor = batchLocation.bedLocation.sensors[0]

    // Find the actuator by its slug
    // const valve = batchLocation.bedLocation.actuators.find(actuator => actuator.slug === 'valve1')

    if (!npkSensor) {
      console.warn(`No NPK sensor found for plot ${batchLocation.bedLocation.name}. Skipping.`)
      return
    }
    // if (!valveSlug) {
    //   console.warn(`No nutrient valve actuator found for plot ${batchLocation.bedLocation.name}. Skipping.`)
    //   return
    // }

    // Extract all necessary info from the preloaded data
    const sensorId = npkSensor.id
    // const actuatorSlug = valve.slug
    const plantId = batchLocation.plantingBatch.plantId
    const plantAge = Math.floor(DateTime.now().diff(batchLocation.plantingBatch.plantingDate, 'days').days)
    const plotName = batchLocation.bedLocation.name

    console.log(`\n--- Processing Plot: ${plotName} (Using Sensor: ${npkSensor.publicName}, Actuator: ${this.PUMP_ACTUATOR_SLUG}, ${this.NUTRIENT_VALVE_SLUG}) ---`);

    // The rest of the logic is identical to before, now using dynamic variables
    const targetParams = await this.plantParameterService.getParametersByAge(plantId, plantAge)
    if (!targetParams) {
      console.log('Failed to get target parameters for this age. Skipping.')
      return
    }

    const actualReadings = await this.sensorReadingService.getLatestReadings(sensorId, 60)
    if (!actualReadings) {
      console.log('Failed to get recent sensor data. Skipping.')
      return
    }

    const effectiveDuration = this.fuzzyDecisionService.calculatePumpDuration(targetParams, actualReadings)
    let totalPumpDuration = 0
    if (effectiveDuration > 0) {
      totalPumpDuration = Math.round(effectiveDuration + this.PUMP_LATENCY_SECONDS)
    }

    console.log(`Decision: Effective Duration=${effectiveDuration}s, Total Duration=${totalPumpDuration}s`)

    if (totalPumpDuration > 0) {
      console.log(`[AKTUATOR] Starting watering cycle for '${this.PUMP_ACTUATOR_SLUG}'...`)

      // Turn ON the pump with retry logic
      await this.sendCommandWithRetry(this.NUTRIENT_VALVE_SLUG, 'ON')
      const pumpTurnOnSuccess = await this.sendCommandWithRetry(this.PUMP_ACTUATOR_SLUG, 'ON')

      // Only proceed if turning ON was successful
      if (pumpTurnOnSuccess) {
        // Wait for the calculated duration
        console.log(`[AKTUATOR] Pump is ON. Waiting for ${totalPumpDuration} seconds...`)
        await new Promise(resolve => setTimeout(resolve, totalPumpDuration * 1000))

        // Turn OFF the pump with retry logic
        console.log(`[AKTUATOR] Time is up. Turning OFF pump '${this.PUMP_ACTUATOR_SLUG}'...`)
        await this.sendCommandWithRetry(this.PUMP_ACTUATOR_SLUG, 'OFF')
        await this.sendCommandWithRetry(this.NUTRIENT_VALVE_SLUG, 'OFF')
      } else {
        console.error(`[AKTUATOR] Failed to turn on pump '${this.PUMP_ACTUATOR_SLUG}'. Aborting watering cycle.`)
      }
    } else {
      console.log('[AKTUATOR] No action needed.')
    }

    console.log(`--- Cycle for Plot: ${plotName} finished ---`)
  }

  /**
   * Helper method to send a command with retry logic.
   * @param slug - The actuator's slug.
   * @param action - The action to perform ('ON' or 'OFF').
   * @param maxRetries - The maximum number of times to retry.
   * @returns True if successful, false otherwise.
   */
  private async sendCommandWithRetry(slug: string, action: 'ON' | 'OFF', maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.actuatorService.controlActuator(slug, { action }, 'System')
        console.log(`[ACTUATOR] Attempt ${attempt}: Command '${action}' for '${slug}' successful.`)
        return true // Command succeeded, exit the loop.
      } catch (error) {
        console.error(`[AKTUATOR] Attempt ${attempt} failed for action '${action}' on '${slug}':`, error.message)
        if (attempt < maxRetries) {
          console.log(`[AKTUATOR] Retrying in 5 seconds...`)
          await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds before retrying.
        }
      }
    }
    console.error(`[AKTUATOR] All ${maxRetries} attempts failed for action '${action}' on '${slug}'. Giving up.`)
    return false // All retries failed.
  }
}
