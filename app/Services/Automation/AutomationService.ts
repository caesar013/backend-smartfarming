import PlantParameterService from "App/Services/PlantParameter/PlantParameterService"
import SensorReadingService from "../SensorReading/SensorReadingService";
import FuzzyDecisionService from "../FuzzyDecision/FuzzyDecisionService";

export default class AutomationService {
  // Initialize required services
  constructor(
    private plantParameterService: PlantParameterService,
    private sensorReadingService: SensorReadingService,
    private fuzzyDecisionService: FuzzyDecisionService
  ) { }

  public async automate() {
    const PUMP_LATENCY_SECONDS = 35; // Delay before the pump starts
    console.log('--- AUTOMATION BEGINS ---')

    // Asumsi untuk pengujian: kita cek untuk stroberi (plantId: 1) berumur 70 hari
    const plantId = 1
    const currentAge = 70
    const sensorId = 2

    // 1. Get TARGET PARAMETERS for the plant at the current age
    const targetParams = await this.plantParameterService.getParametersByAge(plantId, currentAge)

    if (!targetParams) {
      console.log('AUTOMATION FAILED: Couldn\'t retrieve target parameters. Stopping...')
      return
    }

    // 2. Get ACTUAL SENSOR READINGS
    // Get the latest readings for the specified sensor in the last 60 minutes
    const actualReadings = await this.sensorReadingService.getLatestReadings(sensorId, 60)

    if (!actualReadings) {
      console.log('AUTOMATION FAILED: Couldn\'t retrieve sensor data. Stopping...')
      return
    }

    // 3. Compare and display the results in the console
    console.log(`[TARGET FOR AGE ${currentAge} DAYS]`)
    console.log(`   - EC Target: ${targetParams.minSoilEc} - ${targetParams.maxSoilEc} µS/cm`)
    console.log(`   - Humidity Target: ${targetParams.minSoilHumidity} - ${targetParams.maxSoilHumidity} %`)
    console.log('---')
    console.log('[ACTUAL READINGS]')
    console.log(`   - Actual EC: ${actualReadings.soilConductivity} µS/cm`)
    console.log(`   - Actual Humidity: ${actualReadings.soilHumidity} %`)
    console.log('---------------------------------')

    // 4. Use Fuzzy Logic to make decisions
    // This is where the fuzzy logic would be applied to make decisions
    const effectiveDuration = this.fuzzyDecisionService.calculatePumpDuration(targetParams, actualReadings)

    let totalPumpDuration = 0;
    if (effectiveDuration > 0) {
      totalPumpDuration = Math.round(effectiveDuration + PUMP_LATENCY_SECONDS);
    }

    console.log(`[DECISION] Effective Pump Duration: ${effectiveDuration} seconds`)
    console.log(`[DECISION] Total Pump Duration (including latency): ${totalPumpDuration} seconds`)
    console.log('---------------------------------')
    console.log('--- AUTOMATION CYCLE ENDED ---')
  }
}
