import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateActuatorValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    actuatorTypeId: schema.number.optional([
      rules.exists({ table: 'actuator_types', column: 'id' })
    ]),
    bedLocationId: schema.number.optional([
      rules.exists({ table: 'bed_locations', column: 'id' }),
    ]),
    name: schema.string.optional({ trim: true }, [
      rules.maxLength(255),
      rules.minLength(1),
    ]),
  })

  public messages = {
    'actuatorTypeId.exists': 'Actuator type does not exist.',
    'bedLocationId.exists': 'Bed location does not exist.',
    'name.maxLength': 'Name cannot exceed 255 characters.',
    'name.minLength': 'Name must be at least 1 character long.',
  }
}
