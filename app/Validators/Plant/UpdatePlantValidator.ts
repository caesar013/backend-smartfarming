import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePlantValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    name: schema.string.optional({}, [
      rules.minLength(1),
      rules.maxLength(200),
    ]),
    scientificName: schema.string.optional({}, [
      rules.minLength(1),
      rules.maxLength(100)
    ]),
    description: schema.string.optional({ trim: true }),
  })
  public messages = {
    'name.minLength': 'Name must be at least 1 character long.',
    'name.maxLength': 'Name cannot exceed 200 characters.',
    'scientificName.minLength': 'Scientific name must be at least 1 character long.',
    'scientificName.maxLength': 'Scientific name cannot exceed 100 characters.',
    'description.string': 'Description must be a string.',
  }
}
