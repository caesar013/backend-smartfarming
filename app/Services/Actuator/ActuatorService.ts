import BaseService from "App/Base/Services/BaseService"
import ActuatorRepository from "App/Repositories/Actuator/ActuatorRepository"
import ActuatorControlLogRepository, { LogCreationPayload } from "App/Repositories/ActuatorControlLog/ActuatorControlLogRepository"
import mqttClient from "App/Services/Mqtt/MqttService"
import { v4 as uuidv4 } from 'uuid';
import TimeoutException from 'App/Exceptions/TimeoutException'
import { DateTime } from "luxon";
import { Exception } from "@adonisjs/core/build/standalone";

interface ControlPayload {
  action: 'ON' | 'OFF'
}

export default class ActuatorService extends BaseService {
  private logRepository: ActuatorControlLogRepository
  constructor() {
    super(new ActuatorRepository())
    this.logRepository = new ActuatorControlLogRepository()
  }

  /**
   * Controls an actuator by publishing a command to an MQTT topic.
   * @param slug The slug of the actuator to control.
   * @param payload The control action.
   * @param username The username of the user triggering the action.
   * @returns The newly created control log.
   */
  public async controlActuator(
    slug: string,
    payload: ControlPayload,
    options: { durationInMinutes?: number, triggeredBy?: string } = {}
  ): Promise<any> {
    // destructure options to get duration and triggeredBy
    const { durationInMinutes, triggeredBy = "System" } = options
    // 1. Find the actuator to get its relay pin number
    const actuator = await this.repository.findOrFail(slug)

    // 2. Define the MQTT topic and message payload
    // The topic is specific to the actuator's relay pin.
    // and use the pin number from the topic to control the correct relay.
    const topic = `farm/actuator`

    if (!mqttClient.connected) {
      throw new Error("MQTT client is not connected. Cannot send command.")
    }
    try {
      // 1. Generate a unique correlation ID for this command
      // This ID will link this command to its specific response.
      const correlationId = uuidv4()

      // 2. Construct the JSON payload for the command
      const commandPayload = {
        type: 'command',
        action: payload.action,
        pin: actuator.relayPin, // Use the relay pin from the actuator
        correlationId: correlationId, // Include the correlation ID
      }

      // 3. Start waiting for a response from the ESP32
      // This will block until a response is received or a timeout occurs, 10 seconds.
      const responsePromise = mqttClient.waitForResponse(correlationId, 10000);

      // 4. Publish the command to the MQTT topic
      await mqttClient.publishAsync(topic, JSON.stringify(commandPayload), { qos: 1 })

      console.log(`Publishing command to ${actuator.name} with correlation ID: ${correlationId}`)

      // 5. Wait here for the response from the ESP32
      const responsePayload = await responsePromise

      // 6. Check the status of the response from the ESP32
      if (responsePayload.status !== 'SUCCESS') {
        throw new Error(`Failed to control actuator with pin ${responsePayload.pin}. Status: ${responsePayload.status}`);
      }

      // 7. If successful, log the action in the database
      const logData: LogCreationPayload = {
        actuatorId: actuator.id,
        action: payload.action,
        triggeredBy: triggeredBy,
      }

      // Calculate and store turn_off_at when action is 'ON'
      if (payload.action === 'ON') {
        let finalDuration = durationInMinutes
        // If no duration is provided, use the default from the master table
        if (finalDuration === undefined || finalDuration === null) {
          finalDuration = actuator.maxDuration || 10 // Use actuator's max, or fallback to 10
        }

        // Validate against the maximum allowed duration
        if (actuator.maxDuration && finalDuration! > actuator.maxDuration) {
          throw new Exception(`Requested duration of ${finalDuration}m exceeds the maximum allowed ${actuator.maxDuration}m for this actuator.`, 400, 'E_INVALID_DURATION')
        }

        // Add the calculated turn_off_at to the data being logged
        logData.turnOffAt = DateTime.now().plus({ minutes: finalDuration }).toISO()
      }

      const logResponse = await this.logRepository.create(logData)
      return logResponse
    } catch (error) {
      // Specifically handle the timeout error to return a 504 status code.
      if (error.message.startsWith('Timeout')) {
        throw new TimeoutException(error.message);
      }
      // Re-throw any other errors.
      throw error;
    }
  }

  /**
   * This is the method for your cron job. It finds expired actuators
   * and calls `controlActuator` to turn them off.
   */
  public async checkAndDeactivate() {
    console.log('Running scheduled check for actuators to deactivate...')

    // Find the latest 'ON' command for each actuator that is still active
    const actuatorsToTurnOff = await this.logRepository.findExpiredOnCommands()

    if (actuatorsToTurnOff.length === 0) {
      console.log('No actuators to turn off at this time.')
      return
    }

    for (const log of actuatorsToTurnOff) {
      try {
        console.log(`Deactivating actuator ${log.actuatorId} as its schedule has expired.`)

        // Find the actuators to control based on the log entry
        const actuatorToControl = await this.repository.findById(log.actuatorId)
        console.log(`Found actuator: ${actuatorToControl.name} with slug: ${actuatorToControl.slug}`)
        if (actuatorToControl) {
          // Use the existing control method to send the 'OFF' command via MQTT
          await this.sendCommandWithRetry(actuatorToControl.slug, 'OFF');
        } else {
          console.warn(`Could not find actuator with ID ${log.actuatorId} to deactivate. It may have been deleted.`)
        }
      } catch (error) {
        console.error(`Failed to deactivate actuator ${log.actuatorId}:`, error.message)
      }
    }

    console.log(`Successfully processed ${actuatorsToTurnOff.length} actuator(s) for deactivation.`);
  }

  /**
   * This is a method for getting the statuses of all actuators.
   */
  public async getStatusOfAllActuators(): Promise<any[]> {
    return this.repository.getLatestStatusOfAll()
  }

    /**
   * Helper method to send a command with retry logic.
   * @param slug - The actuator's slug.
   * @param action - The action to perform ('ON' or 'OFF').
   * @param maxRetries - The maximum number of times to retry.
   * @returns True if successful, false otherwise.
   */
  public async sendCommandWithRetry(slug: string, action: 'ON' | 'OFF', maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.controlActuator(slug, { action })
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
