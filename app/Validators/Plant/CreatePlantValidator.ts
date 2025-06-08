import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreatePlantValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    name: schema.string({}, [
      rules.required(),
      rules.maxLength(100),
    ]),
    scientific_name: schema.string({}, [
      rules.required(),
      rules.maxLength(100)
    ]),
    description: schema.string.optional({}, [
      rules.nullable(),
      rules.maxLength(255)
    ]),
  })
}
