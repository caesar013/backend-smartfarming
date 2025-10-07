import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ValidationException } from '@ioc:Adonis/Core/Validator'
import SensorTypeService from 'App/Services/SensorType/SensorTypeService'
import CreateSensorTypeValidator from 'App/Validators/SensorType/CreateSensorTypeValidator'
import UpdateSensorTypeValidator from 'App/Validators/SensorType/UpdateSensorTypeValidator'

export default class SensorTypeController {
  service = new SensorTypeService()
  FETCHED_ATTRIBUTE = [
    // attribute
    'name',
    'typeCode',
    'description',
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
      await request.validate(CreateSensorTypeValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.store(data)
      return response.api(result, 'Sensor Type created!', 201)
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
        return response.api(null, `Sensor Type with id: ${params.id} not found`)
      }
      return response.api(result)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async update ({ params, request, response }: HttpContextContract) {
    try {
      await request.validate(UpdateSensorTypeValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.update(params.id, data)
      if (!result) {
        return response.api(null, `Sensor Type with id: ${params.id} not found`)
      }
      return response.api(result, 'Sensor Type updated!')
    } catch (error) {
      if (error instanceof ValidationException) {
        const errorValidation: any = error
        return response.error(errorValidation.message, errorValidation.messages.errors, 422)
      }
      return response.error(error.message)
    }
  }

  public async destroy ({ params, response }: HttpContextContract) {
    try {
      const result = await this.service.delete(params.id)
      if (!result) {
        return response.api(null, `Sensor Type with id: ${params.id} not found`)
      }
      return response.api(null, 'Sensor Type deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async destroyAll ({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll()
      return response.api(null, 'All Sensor Types deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }
}
