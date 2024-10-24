import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RelayService from 'App/Services/Relay/RelayService'
import { schema, rules } from '@ioc:Adonis/Core/Validator'


export default class RelayController {
  service = new RelayService()
  FETCHED_ATTRIBUTE = [
    // attribute
  ]

  public async getRelayStatus({ response }: HttpContextContract) {
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
}
