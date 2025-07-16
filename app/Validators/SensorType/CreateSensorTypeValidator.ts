import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateSensorTypeValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    name: schema.string([
      rules.maxLength(100),
      rules.minLength(3),
    ]),
    typeCode: schema.string([
      rules.maxLength(50),
      rules.minLength(2),
      rules.unique({ table: 'sensor_types', column: 'type_code' }),
    ]),
    description: schema.string.optional({ trim: true }, [
      rules.maxLength(500),
    ]),
  })

  public messages = {
    'name.maxLength': 'Name cannot exceed 100 characters.',
    'name.minLength': 'Name must be at least 3 characters long.',
    'typeCode.maxLength': 'Type code cannot exceed 50 characters.',
    'typeCode.minLength': 'Type code must be at least 2 characters long.',
    'typeCode.unique': 'Type code must be unique.',
    'description.string': 'Description must be a string.',
    'description.maxLength': 'Description cannot exceed 500 characters.',
  }
}
