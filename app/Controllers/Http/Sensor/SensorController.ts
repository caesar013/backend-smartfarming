import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SensorService from 'App/Services/Sensor/SensorService'
import CreateSensorValidator from 'App/Validators/Sensor/CreateSensorValidator'
import { ValidationException } from '@ioc:Adonis/Core/Validator'
import UpdateSensorValidator from 'App/Validators/Sensor/UpdateSensorValidator'

export default class SensorController {
  service = new SensorService()
  FETCHED_ATTRIBUTE = [
    // attribute
    'name',
    'desc',
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
      await request.validate(CreateSensorValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.store(data)
      return response.api(result, 'Sensor created!', 201)
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
        return response.api(null, `Sensor with id: ${params.id} not found`)
      }
      return response.api(result)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      await request.validate(UpdateSensorValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.update(params.id, data)
      if (!result) {
        return response.api(null, `Sensor with id: ${params.id} not found`)
      }
      return response.api(result, 'Sensor updated!')
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
        return response.api(null, `Sensor with id: ${params.id} not found`)
      }
      return response.api(null, 'Sensor deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async destroyAll({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll()
      return response.api(null, 'All Sensor deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }
  public async getLatest({ response }: HttpContextContract) {
    return response.redirect().toRoute('sensor-reading.getLatest')
  }

  public async getData({ request, response }: HttpContextContract) {
    return response.redirect().toRoute('sensor-reading.search', {}, { qs: request.qs() })
  }
}
