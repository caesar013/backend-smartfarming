import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateActuatorTypeValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    typeName: schema.string({ trim: true }, [
      rules.maxLength(100),
      rules.unique({ table: 'actuator_types', column: 'type_name' }),
    ]),
    description: schema.string.optional({ trim: true }),
  })

  public messages = {
    'typeName.maxLength': 'Type name cannot exceed 100 characters.',
    'typeName.unique': 'Type name must be unique.',
    'description.string': 'Description must be a string.',
  }
}
