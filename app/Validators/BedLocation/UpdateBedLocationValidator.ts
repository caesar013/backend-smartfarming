import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateBedLocationValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    name: schema.string.optional({ trim: true }, [
      rules.maxLength(255),
    ]),
    description: schema.string.optional({ trim: true }),
    address: schema.string.optional({ trim: true }),
  })

  public messages = {
    'name.maxLength': 'Name cannot exceed 255 characters.',
    'description.string': 'Description must be a string.',
    'address.string': 'Address must be a string.',
  }
}
