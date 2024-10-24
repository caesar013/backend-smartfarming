import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SensorService from 'App/Services/Sensor/SensorService'

export default class SensorController {
  service = new SensorService()
  FETCHED_ATTRIBUTE = [
    // attribute
  ]

  TIME_RANGE = {
    // range
    HOURLY: 'hour',
    DAILY: 'day',
  }

  public async getData({ request, response }: HttpContextContract) {
    try {
      const options = this.service.parseParams(request.all(), this.TIME_RANGE)
      const result = await this.service.getAll(options)
      // return result
      return this.service.parseResponse(result, 'OK', 200)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async getLatest({ response }: HttpContextContract) {
    try {
      const result = await this.service.getLatest()
      return this.service.parseResponse(result, 'OK', 200)
    } catch (error) {
      return response.error(error.message)
    }
  }
}
