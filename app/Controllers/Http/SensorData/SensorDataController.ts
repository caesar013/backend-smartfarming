import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SensorDataService from 'App/Services/SensorData/SensorDataService'
import CreateSensorDataValidator from 'App/Validators/SensorData/CreateSensorDataValidator'
import UpdateSensorDataValidator from 'App/Validators/SensorData/UpdateSensorDataValidator'
import { ValidationException } from '@ioc:Adonis/Core/Validator'

export default class SensorDataController {
  service = new SensorDataService()
  FETCHED_ATTRIBUTE = [
    // attribute
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
      await request.validate(CreateSensorDataValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.store(data)
      return response.api(result, 'SensorData created!', 201)
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
        return response.api(null, `SensorData with id: ${params.id} not found`)
      }
      return response.api(result)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async update ({ params, request, response }: HttpContextContract) {
    try {
      await request.validate(UpdateSensorDataValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.update(params.id, data)
      if (!result) {
        return response.api(null, `SensorData with id: ${params.id} not found`)
      }
      return response.api(result, 'SensorData updated!')
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
        return response.api(null, `SensorData with id: ${params.id} not found`)
      }
      return response.api(null, 'SensorData deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async destroyAll ({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll()
      return response.api(null, 'All SensorData deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }
}
