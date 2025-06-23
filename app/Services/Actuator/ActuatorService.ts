import BaseService from "App/Base/Services/BaseService"
import ActuatorRepository from "App/Repositories/Actuator/ActuatorRepository"
import ActuatorControlLogRepository from "App/Repositories/ActuatorControlLog/ActuatorControlLogRepository"
import mqttClient from "App/Services/Mqtt/MqttService"
import { v4 as uuidv4 } from 'uuid';
import TimeoutException from 'App/Exceptions/TimeoutException'

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
  public async controlActuator(slug: string, payload: ControlPayload, triggeredBy?: string): Promise<any> {
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
      const logData = {
        actuatorId: actuator.id,
        action: payload.action,
        triggeredBy: triggeredBy || 'System', // Placeholder for who triggered the action
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
   * This is a method for getting the statuses of all actuators.
   */
  public async getStatusOfAllActuators(): Promise<any[]> {
    return this.repository.getLatestStatusOfAll()
  }
}
