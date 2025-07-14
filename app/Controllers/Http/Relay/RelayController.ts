import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Actuator from 'App/Models/Actuator/Actuator';
import ActuatorService from 'App/Services/Actuator/ActuatorService';


/**
 * THIS IS A TEMPORARY COMPATIBILITY CONTROLLER
 * It is used to provide compatibility with the old relay controller
 * It will be removed in the future
 */
export default class RelayController {
  private actuatorService: ActuatorService

  constructor() {
    this.actuatorService = new ActuatorService();
  }

  /**
   * Redirects to the new actuator service
   * This endpoint is deprecated and will be removed in the future
   * @deprecated
   * OLD ROUTE: GET /relay/get-relay
   * NEW LOGIC: ActuatorsService.getStatusOfAllActuators()
   */
  public async getRelayStatus() {
    console.log('LOG: Received request on DEPRECATED /relay/get-relay endpoint. This endpoint is deprecated and will be removed in the future. Redirecting...');

    return {
      data: await this.actuatorService.getStatusOfAllActuators(),
      message: 'This endpoint is deprecated. Use /actuators/status instead.',
    }
  }

  /**
   * Redirects to the new actuator service
   * This endpoint is deprecated and will be removed in the future
   * @deprecated
   * OLD ROUTE: POST /relay/set-relay
   * NEW LOGIC: ActuatorsService.control()
   */
  public async setRelay({ request, response, auth }: HttpContextContract) {
    console.log("LOG: Received request on DEPRECATED /relay/set-relay route. Translating and redirecting...")

    // Validate the request payload
    const oldSetRelaySchema = schema.create({
      // Frontend needs to send the relay ID and state
      // ID: 1-6, State: 0 (disabled) or 1 (enabled)
      id: schema.number(),
      state: schema.number([
        rules.range(0, 1)
      ])
    })

    try {
      const oldPayload = await request.validate({ schema: oldSetRelaySchema })

      // 2. Finds the actuator by relay pin
      const actuator = await Actuator.findBy('relayPin', oldPayload.id)

      if (!actuator) {
        return response.notFound({
          message: `Translation failed! Actuator with relay pin ${oldPayload.id} not found.`,
        })
      }

      // 3. Translates the old payload to the new one
      const actionString = oldPayload.state === 0 ? "ON" : "OFF"

      // 4. Creates a new payload for the new service
      // The new payload should contain the actuator ID and the action
      // We need to modify the payload to match the new service's expectations
      const triggeredBy = auth.user ? auth.user.username : 'Unknown User'
      const newRequest = {
        action: actionString as 'ON' | 'OFF',
      }
      const options = {
        triggeredBy: triggeredBy,
      }

      // 5. Calls the new
      const log = await this.actuatorService.controlActuator(actuator.slug, newRequest, options);

      return response.ok({
        message: `Command sent and acknowledged via deprecated route. Relay pin ${oldPayload.id} is now ${newRequest.action}.`,
        log: log
      })

    } catch (error) {
      return response.status(error.status || 500).send({
        message: `Error processing deprecated setRelay request: ${error.message}`,
        error: error.messages
      })
    }
  }
}
