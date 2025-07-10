import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ActuatorControlLogService from 'App/Services/ActuatorControlLog/ActuatorControlLogService'

export default class ActuatorControlLogController {
  service = new ActuatorControlLogService()

  public async index ({ request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all())
      const result = await this.service.getAll(options)
      return response.api(result, 'OK', 200, request)
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
