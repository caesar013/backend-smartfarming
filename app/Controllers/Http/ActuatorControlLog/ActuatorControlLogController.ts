import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ActuatorControlLogService from 'App/Services/ActuatorControlLog/ActuatorControlLogService'
import CreateActuatorControlLogValidator from 'App/Validators/ActuatorControlLog/CreateActuatorControlLogValidator'
import { ValidationException } from '@ioc:Adonis/Core/Validator'

export default class ActuatorControlLogController {
  service = new ActuatorControlLogService()
  FETCHED_ATTRIBUTE = [
    // attribute
    'actuatorId',
    'action',
    'triggeredBy',
  ]

  public async index ({ request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all())
      const result = await this.service.getAll(options)
      return response.api(result, 'OK', 200, request)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async store ({ request, response }: HttpContextContract) {
    try {
      await request.validate(CreateActuatorControlLogValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.store(data)
      return response.api(result, 'ActuatorControlLog created!', 201)
    } catch (error) {
      if (error instanceof ValidationException) {
        const errorValidation: any = error
        return response.error(errorValidation.message, errorValidation.messages.errors, 422)
      }
      return response.error(error.message)
    }
  }

  public async show ({ params, request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all())
      const result = await this.service.show(params.id, options)
      if (!result) {
        return response.api(null, `ActuatorControlLog with id: ${params.id} not found`)
      }
      return response.api(result)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async destroyAll ({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll()
      return response.api(null, 'All ActuatorControlLog deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }
}
