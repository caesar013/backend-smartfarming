import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SensorReadingService from 'App/Services/SensorReading/SensorReadingService'
import { SearchQuerySchema } from 'App/Validators/SensorReading/SearchValidator'
import { validator } from '@ioc:Adonis/Core/Validator'

export default class SensorReadingController {
  service = new SensorReadingService()

  public async getLatest({ response }: HttpContextContract) {
    try {
      const result = await this.service.getLatestReadings()
      return response.api(result, 'Search results', 200)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async search({ request, response }: HttpContextContract) {
    try {

      const filters = await validator.validate({
        schema: SearchQuerySchema,
        data: request.qs(),
      })

      const result = await this.service.search(filters)

      return response.api(result, 'Search results', 200)
    } catch (error) {
      return response.error(error.message)
    }
  }
}
