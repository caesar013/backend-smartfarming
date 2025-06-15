import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SensorReadingService from 'App/Services/SensorReading/SensorReadingService'
import CreateSensorReadingValidator from 'App/Validators/SensorReading/CreateSensorReadingValidator'
import UpdateSensorReadingValidator from 'App/Validators/SensorReading/UpdateSensorReadingValidator'
import { ValidationException } from '@ioc:Adonis/Core/Validator'

export default class SensorReadingController {
  service = new SensorReadingService()
  FETCHED_ATTRIBUTE = [
    // attribute
  ]

  TIME_RANGE = {
    // range
    HOURLY: 'hour',
    DAILY: 'day',
  }

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
      await request.validate(CreateSensorReadingValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.store(data)
      return response.api(result, 'SensorReading created!', 201)
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
        return response.api(null, `SensorReading with id: ${params.id} not found`)
      }
      return response.api(result)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      await request.validate(UpdateSensorReadingValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.update(params.id, data)
      if (!result) {
        return response.api(null, `SensorReading with id: ${params.id} not found`)
      }
      return response.api(result, 'SensorReading updated!')
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
        return response.api(null, `SensorReading with id: ${params.id} not found`)
      }
      return response.api(null, 'SensorReading deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async destroyAll({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll()
      return response.api(null, 'All SensorReading deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async getLatest({ response }: HttpContextContract) {
    try {
      const result = await this.service.search({ isLatest: true })
      return response.api(result, 'Search results', 200)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async search({ request, response }: HttpContextContract) {
    try {
      const { message, payload } = request.qs()
      const parsedPayload = JSON.parse(payload || '{}')
      return { "msg": 'hello world!', pesan: message, payload: parsedPayload }
      // const options = request.parseParams(request.all())
      // const result = await this.service.search(options)
      // return response.api(result, 'Search results', 200, request)
    } catch (error) {
      return response.error(error.message)
    }
  }
}
