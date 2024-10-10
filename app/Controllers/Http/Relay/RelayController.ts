import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RelayService from 'App/Services/Relay/RelayService'
import CreateRelayValidator from 'App/Validators/Relay/CreateRelayValidator'
import UpdateRelayValidator from 'App/Validators/Relay/UpdateRelayValidator'
import { schema, rules, ValidationException } from '@ioc:Adonis/Core/Validator'


export default class RelayController {
  service = new RelayService()
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
  
  public async getRelayStatus({ auth, response }: HttpContextContract) {
    try {
      const data = await this.service.getStatus();
      
      return response.ok({
        success: true,
        data
      });
    } catch (e){
      return response.internalServerError({
        success: false,
        message: `Can't get relay status! Message: ${e.message}`
      })
    }
  }

  public async setRelay({ request, response }: HttpContextContract) {
    try {
      const setRelaySchema = schema.create({
        id: schema.number([
          rules.range(1, 6)
        ]),
        state: schema.number([
          rules.range(0, 1)
        ])
      });

      const payload = await request.validate({ schema: setRelaySchema });

      const result = await this.service.setRelay(payload.id, payload.state);

      if(!result.success){
        return response.badRequest({
          success: false,
          message: result.message
        });
      }
      
      return response.created({
        success: true,
        message: `Relay ${payload.id} ${payload.state == 0 ? 'Disabled!' : 'Enabled'}`
      });

    } catch (e) {
      return response.badRequest({
        success: false,
        message: `Error creating state for relay! Message: ${e.message}`,
        error: e.messages
      });
    }
  }

  public async store ({ request, response }: HttpContextContract) {
    try {
      await request.validate(CreateRelayValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.store(data)
      return response.api(result, 'Relay created!', 201)
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
        return response.api(null, `Relay with id: ${params.id} not found`)
      }
      return response.api(result)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async update ({ params, request, response }: HttpContextContract) {
    try {
      await request.validate(UpdateRelayValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.update(params.id, data)
      if (!result) {
        return response.api(null, `Relay with id: ${params.id} not found`)
      }
      return response.api(result, 'Relay updated!')
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
        return response.api(null, `Relay with id: ${params.id} not found`)
      }
      return response.api(null, 'Relay deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async destroyAll ({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll()
      return response.api(null, 'All Relay deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }
}
