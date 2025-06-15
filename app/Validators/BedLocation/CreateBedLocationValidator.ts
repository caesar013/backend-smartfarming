import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateBedLocationValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    name: schema.string({ trim: true }, [
      rules.minLength(3),
      rules.maxLength(255),
    ]),
    description: schema.string.optional({ trim: true }),
    address: schema.string.optional({ trim: true }),
  })
}
