import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateActuatorTypeValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    typeName: schema.string.optional({ trim: true }, [
      rules.required(),
      rules.maxLength(100),
      rules.unique({ table: 'actuator_types', column: 'type_name' }),
    ]),
    description: schema.string.optional({ trim: true }),
  })
}
