import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ActuatorService from 'App/Services/Actuator/ActuatorService'
import CreateActuatorValidator from 'App/Validators/Actuator/CreateActuatorValidator'
import UpdateActuatorValidator from 'App/Validators/Actuator/UpdateActuatorValidator'
import { ValidationException } from '@ioc:Adonis/Core/Validator'
import ActuatorControlValidator from 'App/Validators/Actuator/ActuatorControlValidator'

export default class ActuatorController {
  service = new ActuatorService()
  FETCHED_ATTRIBUTE = [
    // attribute
    'actuatorTypeId',
    'bedLocationId',
    'name',
  ]

  public async index({ request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all())
      const result = await this.service.getAll(options)
      return response.api(result, 'OK', 200, request)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      await request.validate(CreateActuatorValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.store(data)
      return response.api(result, 'Actuator created!', 201)
    } catch (error) {
      if (error instanceof ValidationException) {
        const errorValidation: any = error
        return response.error(errorValidation.message, errorValidation.messages.errors, 422)
      }
      return response.error(error.message)
    }
  }

  public async show({ params, request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all())
      const result = await this.service.show(params.id, options)
      if (!result) {
        return response.api(null, `Actuator with id: ${params.id} not found`)
      }
      return response.api(result)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      await request.validate(UpdateActuatorValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.update(params.id, data)
      if (!result) {
        return response.api(null, `Actuator with id: ${params.id} not found`)
      }
      return response.api(result, 'Actuator updated!')
    } catch (error) {
      if (error instanceof ValidationException) {
        const errorValidation: any = error
        return response.error(errorValidation.message, errorValidation.messages.errors, 422)
      }
      return response.error(error.message)
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const result = await this.service.delete(params.id)
      if (!result) {
        return response.api(null, `Actuator with id: ${params.id} not found`)
      }
      return response.api(null, 'Actuator deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async destroyAll({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll()
      return response.api(null, 'All Actuator deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  /**
 * @swagger
 * /api/actuators/{id}/control:
 * post:
 * tags:
 * - Actuators
 * summary: Send a command to control a specific actuator.
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: The numeric ID of the actuator to control.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * action:
 * type: string
 * enum: [ON, OFF]
 * description: The command to send to the relay.
 * triggeredBy:
 * type: string
 * description: "Who or what triggered the action (e.g., 'User: John Doe', 'Automation Rule')."
 * required:
 * - action
 * - triggeredBy
 * responses:
 * 200:
 * description: Command sent successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * log:
 * $ref: '#/components/schemas/ActuatorControlLog'
 * 404:
 * description: Actuator not found.
 * 422:
 * description: Validation error (e.g., invalid action).
 */

  public async control({ params, request, response, auth }: HttpContextContract) {
    try {
      // Validate the request payload
      const payload = await request.validate(ActuatorControlValidator)

      // Get the slug from the URL.
      const slug = params.slug

      // Add the authenticated user to the payload
      const username = auth.user ? `User: ${auth.user.username}` : 'System'

      // Call the service to handle the logic
      const log = await this.service.controlActuator(slug, payload, username)

      return response.ok({
        message: 'Command sent successfully to the actuator.',
        log: log
      })
    } catch (error) {
      // Handle errors, e.g., validation errors or actuator not found
      return response.status(error.status || 500).send({
        message: 'Failed to send command.',
        error: error.message,
        details: error.messages || {}
      })
    }
  }

  /**
 * This method replaces the old 'getRelayStatus' functionality.
 * It handles a GET request to fetch the last known status of all actuators
 * from the database logs.
 * Route: GET /api/v1/actuators/status
 */
  public async getStatus({ response }: HttpContextContract) {
    try {
      // Call the service to get the status of all actuators
      const statuses = await this.service.getStatusOfAllActuators()

      return response.ok({
        data: statuses,
        message: 'Successfully fetched the status of all actuators.',
      })
    } catch (error) {
      return response.error(error.message)
    }
  }
}
