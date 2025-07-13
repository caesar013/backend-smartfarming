import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ActuatorControlLogService from 'App/Services/ActuatorControlLog/ActuatorControlLogService'

export default class ActuatorControlLogController {
  service = new ActuatorControlLogService()

  public async index({ request, response }: HttpContextContract) {
    try {
      // The request.all() will contain your query params:
      // ?actuatorId=1&status=ON&startDate=2024-11-06&endDate=2024-11-07
      const options = {
        // You might need a more robust way to parse these
        // but this shows the basic idea.
        filter: {
          actuatorId: request.input('actuatorId'),
          status: request.input('status'),
          startDate: request.input('startDate'),
          endDate: request.input('endDate'),
        },
        pagination: {
          page: request.input('page', 1),
          limit: request.input('limit', 10),
        },
        sort: {
            field: request.input('sort_field', 'createdAt'),
            direction: request.input('sort_direction', 'desc')
        }
      }

      // Call the new service method
      const result = await this.service.getLogs(options)

      return response.api(result, 'OK', 200) // request object is often not needed here
    } catch (error) {
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
}
