// app/Controllers/Http/AutomationController.ts

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FuzzyDecisionService from 'App/Services/FuzzyDecision/FuzzyDecisionService'

export default class AutomationController {
  public async processSensorData({ request, response }: HttpContextContract) {
    // --- 1. Get Sensor Data (Actual Readings) ---
    // This data would typically come from your ESP32 via the request body.
    // For this example, we'll use sample data.
    const actualReadings = {
      soilConductivity: request.input('soil_conductivity', 800), // Example: 800 µS/cm
      soilHumidity: request.input('soil_humidity', 45),       // Example: 45%
      soilPh: request.input('soil_ph', 5.5),                  // Example: 5.5
    }

    // --- 2. Define Target Parameters ---
    // These values should be configured for your specific strawberry plants.
    // You could store and retrieve these from a database.
    const targetParams = {
      minSoilEc: 1000,
      maxSoilEc: 1500,
      minSoilHumidity: 50,
      maxSoilHumidity: 70,
      minPh: 5.8,
      maxPh: 6.5,
    }

    // --- 3. Instantiate and Run the Fuzzy Logic ---
    const fuzzyService = new FuzzyDecisionService()
    const decision = fuzzyService.calculateDecision(targetParams, actualReadings)

    // --- 4. Return the Result ---
    // The `decision` object contains the final pump duration and pH recommendation.
    // You can now save this to a database, send it to another service,
    // or return it as a JSON response.

    console.log('[FUZZY_RESULT]', decision)

    return response.json({
      message: 'Fuzzy logic processed successfully.',
      decision: {
        pump_duration_seconds: decision.pumpDuration,
        ph_recommendation: decision.phRecommendation,
      },
      inputs: {
        target: targetParams,
        actual: actualReadings,
      },
    })
  }
}
