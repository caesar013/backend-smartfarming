import PlantParameterService from "App/Services/PlantParameter/PlantParameterService"
import SensorReadingService from "../SensorReading/SensorReadingService"
import FuzzyDecisionService from "../FuzzyDecision/FuzzyDecisionService"
import ActuatorService from "../Actuator/ActuatorService"
import BatchLocation from "App/Models/BatchLocation"
import { DateTime } from "luxon"
import Logger from '@ioc:Adonis/Core/Logger'
import FuzzyIrrigationService from "App/Services/FuzzyDecision/FuzzyIrrigationService"
import AutomationLog from "App/Models/Automation/AutomationLog"
import AutomationStatusService from "../AutomationStatus/AutomationStatusService"


export default class AutomationService {
  // Flag to indicate if the irrigation automation feature is enabled.
  private static isIrrigationEnabled: boolean = false
  // Flag to prevent concurrent execution of the automation task.
  private static isRunningIrrigation: boolean = false
  // Flag to indicate if the nutrition automation feature is enabled.
  private static isNutritionEnabled: boolean = false
  // Flag to prevent concurrent execution of the nutrition automation task.
  private static isRunningNutrition: boolean = false
  private automationStatusService: AutomationStatusService
  // Initialize required services
  constructor(
    private plantParameterService: PlantParameterService,
    private sensorReadingService: SensorReadingService,
    private fuzzyDecisionService: FuzzyDecisionService, // for nutrition
    private fuzzyIrrigationService: FuzzyIrrigationService, // for irrigation
    private actuatorService: ActuatorService
  ) {
    this.automationStatusService = new AutomationStatusService()
  }

  PUMP_LATENCY_SECONDS = 15
  PUMP_ACTUATOR_SLUG = 'pump'
  NUTRIENT_VALVE_SLUG = 'nutrient-valve'
  WATER_VALVE_SLUG = 'water-valve'
  /**
   * Main automation function that orchestrates the entire process
   * @returns {Promise<void>}
   */
  public async automateNutrition() {
    // Get the status of the nutrition automation feature
    const statusRecord = await this.automationStatusService.getStatus('NUTRITION') // <-- Use the service to get the status
    const isNutritionEnabled = statusRecord.isActive

    // Check if the nutrition automation feature is enabled
    if (!isNutritionEnabled) {
      Logger.info('[NUTRITION_AUTOMATION] Nutrition automation feature is OFF. Stopping process.')
      return
    }

    // Prevent concurrent execution of the nutrition automation cycle
    if (AutomationService.isRunningNutrition) {
      Logger.warn('[NUTRITION_AUTOMATION] Another nutrition cycle is already running. Skipping this cycle.')
      return
    }

    try {

      console.log('--- GLOBAL NUTRITION AUTOMATION CYCLE BEGINS ---')

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

      console.log('--- GLOBAL NUTRITION AUTOMATION CYCLE ENDED ---')
    } catch (error) {
      // Log the error with a more descriptive message
      Logger.error(`An error occurred during the automation cycle: ${error.message}`)
    } finally {
      // Reset the running flags to allow future executions
      AutomationService.isRunningNutrition = false
    }
  }
  /**
    * Fungsi otomasi utama untuk IRIGASI.
    * DIUBAH untuk mencari sensor yang benar dan menggunakan syarat yang benar.
    */
  public async automateIrrigation() {
    // Pengecekan apakah fitur irigasi menyala
    if (!AutomationService.isIrrigationEnabled) {
      Logger.info('[IRRIGATION_AUTOMATION] Irrigation automation feature is OFF. Stopping process.')
      return // Feature is off, do nothing.
    }

    if (AutomationService.isRunningIrrigation) {
      Logger.warn('[IRRIGATION_AUTOMATION] Another irrigation cycle is already running. Skipping this cycle.')
      return // Prevent concurrent execution
    }

    try {
      AutomationService.isRunningIrrigation = true // Set the flag to prevent concurrent execution
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
          await this.processSingleLocationForIrrigation(batchLocation)
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
  private async processSingleLocationForIrrigation(batchLocation: BatchLocation,) {
    const plotName = batchLocation.bedLocation.name;
    Logger.info(`\n--- [IRRIGATION] Processing Plot: ${plotName} ---`);

    // --- 1. Ambil Data Sensor ---
    const npkSensor = batchLocation.bedLocation.sensors.find(s => s.sensorType.typeCode === 'NPK');
    let suhuTanah: number | undefined;
    let kelembapanTanah: number | undefined;

    try {
      const npkLatestReadingsResponse = await this.sensorReadingService.getLatestReadings(npkSensor?.id, 60);
      if (npkSensor) {
        suhuTanah = npkLatestReadingsResponse.soilTemperature;
        kelembapanTanah = npkLatestReadingsResponse.soilHumidity;
        Logger.info(`[IRRIGATION] Reading from sensor '${npkSensor.name}', Humidity: ${kelembapanTanah}, Soil Temperature: ${suhuTanah},`);
      }
    } catch (error) {
      Logger.error(`[IRRIGATION] Failed to get or parse sensor readings for plot ${plotName}. Error: ${error.message}`);
      return; // Hentikan proses untuk lokasi ini jika sensor gagal dibaca
    }

    // --- 2. Validasi Data Sensor ---
    if (suhuTanah === undefined || kelembapanTanah === undefined) {
      Logger.warn(`[IRRIGATION] Critical sensor data (temp/humidity) is null or missing for plot ${plotName}. Skipping.`);
      return;
    }

    // --- 3. Hitung Keputusan menggunakan Fuzzy Logic ---
    const effectiveDuration = this.fuzzyIrrigationService.calculateIrrigationDuration({
      suhuTanah: suhuTanah,
      kelembapanTanah: kelembapanTanah,
    });

    // --- 4. Simpan Log Keputusan ke Database ---
    try {
      await AutomationLog.create({
        batchLocationId: batchLocation.id,
        automationStatusId: 1,
        payloadInput: {
          npkTemperatureInput: suhuTanah,
          npkHumidityInput: kelembapanTanah,
        },
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
      await this.actuatorService.sendCommandWithRetry(this.WATER_VALVE_SLUG, 'ON');
      const pumpTurnOnSuccess = await this.actuatorService.sendCommandWithRetry(this.PUMP_ACTUATOR_SLUG, 'ON');

      if (pumpTurnOnSuccess) {
        Logger.info(`[AKTUATOR] Pump and Valve is ON. Waiting for ${totalPumpDuration} seconds...`);
        await new Promise(resolve => setTimeout(resolve, totalPumpDuration * 1000));

        Logger.info(`[AKTUATOR] Time is up. Turning OFF pump and valve.`);
        await this.actuatorService.sendCommandWithRetry(this.PUMP_ACTUATOR_SLUG, 'OFF');
        await this.actuatorService.sendCommandWithRetry(this.WATER_VALVE_SLUG, 'OFF');
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

    if (!npkSensor) {
      console.warn(`No NPK sensor found for plot ${batchLocation.bedLocation.name}. Skipping.`)
      return
    }

    // Extract all necessary info from the preloaded data
    const sensorId = npkSensor.id
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

    const { pumpDuration } = this.fuzzyDecisionService.calculateDecision(targetParams, actualReadings)
    let totalPumpDuration = 0
    if (pumpDuration > 0) {
      totalPumpDuration = Math.round(pumpDuration + this.PUMP_LATENCY_SECONDS)
    }

    console.log(`Decision: Effective Duration=${pumpDuration}s, Total Duration=${totalPumpDuration}s`)

    if (totalPumpDuration > 0) {
      console.log(`[AKTUATOR] Starting watering cycle for '${this.PUMP_ACTUATOR_SLUG}'...`)

      // Turn ON phase
      const turnOnSuccessful = await this.executeCommands([
        { slug: this.NUTRIENT_VALVE_SLUG, command: 'ON' },
        { slug: this.PUMP_ACTUATOR_SLUG, command: 'ON' },
      ])

      // Only proceed if turning ON was successful
      if (turnOnSuccessful) {
        AutomationService.isRunningNutrition = true // Set the flag to prevent concurrent execution
        // Wait for the calculated duration
        console.log(`[AKTUATOR] NUTRITION AUTOMATION is ON. Waiting for ${totalPumpDuration} seconds...`)
        await new Promise(resolve => setTimeout(resolve, totalPumpDuration * 1000))

        // Turn OFF phase
        console.log(`[AKTUATOR] Time is up. Turning OFF pump '${this.PUMP_ACTUATOR_SLUG}'...`)
        const turnOffSuccessful = await this.executeCommands([
          { slug: this.PUMP_ACTUATOR_SLUG, command: 'OFF' },
          { slug: this.NUTRIENT_VALVE_SLUG, command: 'OFF' },
        ])

        // Log the result
        if (turnOffSuccessful) {
          AutomationService.isRunningNutrition = false // Reset the flag for future runs
          try {
            await AutomationLog.create({
              batchLocationId: batchLocation.id,
              automationStatusId: 2,
              payloadInput: {
                npkConductivityInput: actualReadings.soilConductivity,
                npkHumidityInput: actualReadings.soilHumidity,
              },
              state: pumpDuration > 0 ? 'Otomasi Nutrisi Berjalan' : 'Otomasi Nutrisi Tidak Diperlukan',
              duration: Math.round(pumpDuration),
            });
            Logger.info(`[LOG] Automation decision for plot '${plotName}' has been logged to the database.`);
          } catch (dbError) {
            // Jika logging gagal, proses irigasi tetap lanjut.
            // Kita hanya mencatat errornya agar tidak mengganggu fungsi utama.
            Logger.error(`[LOG] Failed to write automation log to database: ${dbError.message}`);
          }
        } else {
          console.error(`[AKTUATOR] Failed to turn OFF pump '${this.PUMP_ACTUATOR_SLUG}' or nutrient valve '${this.NUTRIENT_VALVE_SLUG}'.`)
        }
      } else {
        console.error(`[AKTUATOR] Failed to turn on pump '${this.PUMP_ACTUATOR_SLUG}'. Aborting watering cycle.`)
      }
    } else {
      console.log('[AKTUATOR] No action needed.')
    }

    console.log(`--- Cycle for Plot: ${plotName} finished ---`)
  }

  /**
   *
   */
  private async executeCommands(commands) {
    // Map each command to a promise that executes it
    const commandPromises = commands.map(cmd =>
      this.actuatorService.sendCommandWithRetry(cmd.slug, cmd.command)
    );

    // Wait for all commands to complete
    const results = await Promise.all(commandPromises);

    // Check if every command in the results array returned true
    const allSucceeded = results.every(success => success);

    if (!allSucceeded) {
      console.error(`[AKTUATOR] Failed to execute one or more commands successfully.`);
    }

    return allSucceeded;
  }

  /**
   * Initializes the service's state from the database.
   * This should be called only once when the application boots up.
   * @param statusService An instance of the AutomationStatusService.
   */
  public static async initializeState(statusService: AutomationStatusService) {
    try {
      Logger.info('[AUTOMATION_SERVICE] Initializing irrigation state from database...')
      // Fetch the status record for irrigation
      const statusRecord = await statusService.getStatus('IRRIGATION')
      this.isIrrigationEnabled = statusRecord.isActive

      // Fetch the status record for nutrition
      const nutritionStatusRecord = await statusService.getStatus('NUTRITION')
      this.isNutritionEnabled = nutritionStatusRecord.isActive

      // Log the initialized state
      Logger.info(`[AUTOMATION_SERVICE] Irrigation state initialized to: ${this.isIrrigationEnabled}`)
      Logger.info(`[AUTOMATION_SERVICE] Nutrition state initialized to: ${this.isNutritionEnabled}`)
    } catch (error) {
      Logger.error('Failed to initialize irrigation state from database: %j', error)
      // Set a safe default (false) if initialization fails.
      this.isIrrigationEnabled = false
      this.isNutritionEnabled = false
    }
  }

  /**
   * Updates the cached state when it's changed elsewhere (e.g., via an API call).
   * This keeps the cache in sync with the database without a server restart.
   * @param system The name of the system being updated (e.g., 'IRRIGATION').
   * @param isEnabled The new state.
   */
  public static updateCachedState(system: string, isEnabled: boolean) {
    if (system.toUpperCase() === 'IRRIGATION') {
      if (this.isIrrigationEnabled !== isEnabled) {
        Logger.info(`[AUTOMATION_SERVICE] Updating cached irrigation state to: ${isEnabled}`)
        this.isIrrigationEnabled = isEnabled
      }
    } else if (system.toUpperCase() === 'NUTRITION') {
      if (this.isNutritionEnabled !== isEnabled) {
        Logger.info(`[AUTOMATION_SERVICE] Updating cached nutrition state to: ${isEnabled}`)
        this.isNutritionEnabled = isEnabled
      }
    } else {
      Logger.warn(`[AUTOMATION_SERVICE] Unknown system: ${system}. No state updated.`)
    }
  }
}
