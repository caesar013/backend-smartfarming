import PlantParameterService from "App/Services/PlantParameter/PlantParameterService"
import SensorReadingService from "../SensorReading/SensorReadingService"
import FuzzyDecisionService from "../FuzzyDecision/FuzzyDecisionService"
import ActuatorService from "../Actuator/ActuatorService"
import BatchLocation from "App/Models/BatchLocation"
import { DateTime } from "luxon"

export default class AutomationService {
  // Initialize required services
  constructor(
    private plantParameterService: PlantParameterService,
    private sensorReadingService: SensorReadingService,
    private fuzzyDecisionService: FuzzyDecisionService,
    private actuatorService: ActuatorService
  ) { }

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
   * Processes the automation logic for a single BatchLocation.
   */
  private async processSingleBatchLocation(batchLocation: BatchLocation) {
    const PUMP_LATENCY_SECONDS = 35
    const PUMP_ACTUATOR_SLUG = 'pump'
    const NUTRIENT_VALVE_SLUG = 'nutrient-valve'

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

    console.log(`\n--- Processing Plot: ${plotName} (Using Sensor: ${npkSensor.publicName}, Actuator: ${PUMP_ACTUATOR_SLUG}, ${NUTRIENT_VALVE_SLUG}) ---`);

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
      totalPumpDuration = Math.round(effectiveDuration + PUMP_LATENCY_SECONDS)
    }

    console.log(`Decision: Effective Duration=${effectiveDuration}s, Total Duration=${totalPumpDuration}s`)

    if (totalPumpDuration > 0) {
      console.log(`[AKTUATOR] Starting watering cycle for '${PUMP_ACTUATOR_SLUG}'...`)

      // Turn ON the pump with retry logic
      await this.actuatorService.sendCommandWithRetry(NUTRIENT_VALVE_SLUG, 'ON')
      const pumpTurnOnSuccess = await this.actuatorService.sendCommandWithRetry(PUMP_ACTUATOR_SLUG, 'ON')

      // Only proceed if turning ON was successful
      if (pumpTurnOnSuccess) {
        // Wait for the calculated duration
        console.log(`[AKTUATOR] Pump is ON. Waiting for ${totalPumpDuration} seconds...`)
        await new Promise(resolve => setTimeout(resolve, totalPumpDuration * 1000))

        // Turn OFF the pump with retry logic
        console.log(`[AKTUATOR] Time is up. Turning OFF pump '${PUMP_ACTUATOR_SLUG}'...`)
        await this.actuatorService.sendCommandWithRetry(PUMP_ACTUATOR_SLUG, 'OFF')
        await this.actuatorService.sendCommandWithRetry(NUTRIENT_VALVE_SLUG, 'OFF')
      } else {
        console.error(`[AKTUATOR] Failed to turn on pump '${PUMP_ACTUATOR_SLUG}'. Aborting watering cycle.`)
      }
    } else {
      console.log('[AKTUATOR] No action needed.')
    }

    console.log(`--- Cycle for Plot: ${plotName} finished ---`)
  }

}
