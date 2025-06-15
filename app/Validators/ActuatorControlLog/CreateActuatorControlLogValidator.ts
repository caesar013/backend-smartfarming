import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateActuatorControlLogValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    actuatorId: schema.number([
      rules.exists({ table: 'actuators', column: 'id' }),
    ]),
    action: schema.string({}, [
      rules.maxLength(50),
      rules.minLength(1),
    ]),
    triggeredBy: schema.string({}, [
      rules.maxLength(100),
      rules.minLength(1),
    ]),
  })
}
