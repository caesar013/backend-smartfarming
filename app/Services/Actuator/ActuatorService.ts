import BaseService from "App/Base/Services/BaseService"
import ActuatorRepository from "App/Repositories/Actuator/ActuatorRepository"
import ActuatorControlLogRepository from "App/Repositories/ActuatorControlLog/ActuatorControlLogRepository"
import mqttClient from "App/Services/Mqtt/MqttService"

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
  public async controlActuator(slug: string, payload: ControlPayload, username: string): Promise<any> {
    // 1. Find the actuator to get its relay pin number
    const actuator = await this.repository.findOrFail(slug)

    // 2. Define the MQTT topic and message payload
    // The topic is specific to the actuator's relay pin.
    // The ESP32 will listen on a wildcard topic like 'farm/actuator/+/command'
    // and use the pin number from the topic to control the correct relay.
    const topic = `farm/actuator/${actuator.relayPin}/command`
    const message = payload.action // 'ON' or 'OFF'

    // 3. Publish the message to the MQTT broker
    // Ensure the client is connected before publishing
    if (!mqttClient.connected) {
      throw new Error("MQTT client is not connected. Cannot send command.")
    }
    await mqttClient.publishAsync(topic, message, { qos: 1 }) // QoS 1 for "at least once" delivery

    // 4. Create a log entry for this action
    const logData = {
      actuatorId: actuator.id,
      action: payload.action,
      triggeredBy: username, // Placeholder for who triggered the action
    }
    const newLog = await this.logRepository.create(logData)

    return newLog
  }
}
