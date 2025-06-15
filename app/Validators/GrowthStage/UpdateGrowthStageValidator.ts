import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateGrowthStageValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    name: schema.string.optional({ trim: true }, [
      rules.maxLength(100),
      rules.unique({
        table: 'growth_stages',
        column: 'name',
        whereNot: { id: this.ctx.params.id },
      }),
    ]),
    order: schema.number.optional([
      rules.unsigned(),
      rules.unique({
        table: 'growth_stages',
        column: 'order',
        whereNot: { id: this.ctx.params.id },
      }),
    ]),
    description: schema.string.optional({ trim: true }),
  })
}
