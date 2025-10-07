import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class HealthCheckValidator {
  constructor(protected ctx: HttpContextContract) {}

  /**
   * Defines the validation schema for the health check request.
   * It expects a 'target' string in the request body.
   */
  public schema = schema.create({
    target: schema.string([
      rules.trim(),
      // Example of how you could restrict targets to a specific list:
      // rules.enum(['npk_1', 'npk_2', 'dht', 'valve_1', 'valve_2', 'valve_3', 'pump', 'water_valve'])
    ]),
    type: schema.string([
      rules.trim(),
    ])
  })

  /**
   * Custom error messages for the validation rules.
   */
  public messages = {
    'target.required': 'The "target" device/sensor is required in the request body.',
    'target.string': 'The "target" must be a string identifier.',
  }
}
