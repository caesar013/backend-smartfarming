import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateActuatorValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    actuatorTypeId: schema.number([
      rules.exists({ table: 'actuator_types', column: 'id' })
    ]),
    bedLocationId: schema.number.optional([
      rules.required(),
      rules.exists({ table: 'bed_locations', column: 'id' })
    ]),
    name: schema.string({ trim: true }, [
      rules.maxLength(255),
      rules.minLength(1),
    ]),
  })
}
