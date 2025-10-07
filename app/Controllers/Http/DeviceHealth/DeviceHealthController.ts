import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MqttService from 'App/Services/Mqtt/MqttService'
import { v4 as uuidv4 } from 'uuid' // Used to generate unique IDs
import HealthCheckValidator from 'App/Validators/HealthCheck/HealthCheckValidator'
import SensorReadingRepository from 'App/Repositories/SensorReading/SensorReadingRepository'
import ActuatorRepository from 'App/Repositories/Actuator/ActuatorRepository'

export default class DeviceHealthController {
  /**
   * Handles an incoming HTTP request to check the status of a specific device.
   */
  public async checkDeviceStatus({ request, response }: HttpContextContract) {
    // 1. Validate that the request body now contains a 'target' and a 'type'
    const { target: publicName, type } = await request.validate(HealthCheckValidator)

    const sensorRepo = new SensorReadingRepository()
    const actuatorRepo = new ActuatorRepository()

    let device: any = null

    // 2. Use the 'type' from the request to query the correct repository
    if (type.toLowerCase() === 'sensor') {
      device = await sensorRepo.findByPublicName(publicName)
    } else if (type.toLowerCase() === 'actuator') {
      device = await actuatorRepo.find(publicName)
    }

    // 3. If the device is not found in the specified repository, return an error
    if (!device) {
      return response.notFound({
        error: `Device with public name '${publicName}' and type '${type}' not found.`,
      })
    }

    let internalTargetName: string = ''
    if (type.toLowerCase() === 'sensor') {
      // For sensors, the internal name is in the 'name' column
      internalTargetName = device.name;
    } else if (type.toLowerCase() === 'actuator') {
      // For actuators, the internal name is in the 'slug' column
      internalTargetName = device.slug;
    }

    // 5. Check if the MQTT service is connected
    if (!MqttService.connected) {
      return response.serviceUnavailable({
        error: 'Cannot perform health check: MQTT service is not connected.',
      })
    }

    // 6. Prepare the request to be sent to the ESP32
    const correlationId = uuidv4()
    const healthCheckTopic = 'farm/health_check'
    const payload = {
      type: 'check_request',
      target: internalTargetName, // Use the correct internal name for the device
      correlationId: correlationId,
    }

    try {
      // 7. Publish the request and wait for the response
      console.log(
        `[Health Check] Publishing request for target: ${internalTargetName} (public: ${publicName}) with ID: ${correlationId}`
      )
      await MqttService.publishAsync(healthCheckTopic, JSON.stringify(payload))

      // Wait up to 10 seconds for a response from the ESP32
      const espResponse = await MqttService.waitForResponse(correlationId, 10000)

      console.log(`[Health Check] Received response for ID: ${correlationId}`, espResponse)

      // 8. Forward the ESP32's response back to the frontend
      return response.ok(espResponse)
    } catch (error) {
      // This block will run if waitForResponse times out
      console.error(`[Health Check] Timeout for target ${internalTargetName}:`, error.message)
      return response.gatewayTimeout({
        target: publicName, // Return the public name in the error
        status: 'offline',
        reason: 'No response from device (timeout).',
      })
    }
  }
}
