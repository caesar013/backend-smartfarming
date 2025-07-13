import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateSensorTypeValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    name: schema.string.optional([
      rules.maxLength(100),
      rules.minLength(3),
    ]),
    typeCode: schema.string.optional([
      rules.maxLength(50),
      rules.minLength(2),
      rules.unique({
        table: 'sensor_types',
        column: 'type_code',
        whereNot: { id: this.ctx.params.id } // Ensure uniqueness except for the current record
      }),
    ]),
    description: schema.string.optional({ trim: true }, [
      rules.maxLength(500),
    ]),
  })
}
