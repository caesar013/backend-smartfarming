import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreatePlantValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    name: schema.string({}, [
      rules.maxLength(200),
    ]),
    scientificName: schema.string.optional({}, [
      rules.maxLength(100)
    ]),
    description: schema.string.optional({ trim: true }),
  })

  public messages = {
    'name.maxLength': 'Name cannot exceed 200 characters.',
    'scientificName.maxLength': 'Scientific name cannot exceed 100 characters.',
    'description.string': 'Description must be a string.',
  }
}
