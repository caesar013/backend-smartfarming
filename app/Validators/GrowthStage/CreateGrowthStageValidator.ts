import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateGrowthStageValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    name: schema.string({ trim: true }, [
      rules.maxLength(100),
      rules.unique({ table: 'growth_stages', column: 'name' }),
    ]),
    order: schema.number([
      rules.unsigned(),
      rules.unique({ table: 'growth_stages', column: 'order' }),
    ]),
    description: schema.string.optional({ trim: true }),
  })
}
