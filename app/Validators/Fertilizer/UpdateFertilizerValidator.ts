import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateFertilizerValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    name: schema.string.optional({ trim: true }, [
      rules.maxLength(255),
      rules.unique({
        table: 'fertilizers',
        column: 'name',
        whereNot: { id: this.ctx.params.id },
      }),
    ]),
    nPercentage: schema.number.optional([
      rules.unsigned(),
    ]),
    pPercentage: schema.number.optional([
      rules.unsigned(),
    ]),
    kPercentage: schema.number.optional([
      rules.unsigned(),
    ]),
  })

  public messages = {
    'name.maxLength': 'Name cannot exceed 255 characters.',
    'name.unique': 'Name must be unique.',
    'nPercentage.unsigned': 'N Percentage must be a positive number.',
    'pPercentage.unsigned': 'P Percentage must be a positive number.',
    'kPercentage.unsigned': 'K Percentage must be a positive number.',
  }
}
