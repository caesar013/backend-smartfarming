import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePlantGrowthParameterValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    plantId: schema.number.optional([
      rules.required(),
      rules.unsigned(),
      rules.exists({ table: 'plants', column: 'id' }),
    ]),
    growthStageId: schema.number.optional([
      rules.required(),
      rules.unsigned(),
      rules.exists({ table: 'growth_stages', column: 'id' }),
    ]),
    minAge: schema.number.optional([
      rules.required(),
      rules.unsigned(),
    ]),
    maxAge: schema.number.optional([
      rules.unsigned(),
    ]),
    minN: schema.number.optional([
      rules.required(),
      rules.unsigned(),
    ]),
    maxN: schema.number.optional([
      rules.unsigned(),
    ]),
    minP: schema.number.optional([
      rules.required(),
      rules.unsigned(),
    ]),
    maxP: schema.number.optional([
      rules.unsigned(),
    ]),
    minK: schema.number.optional([
      rules.required(),
      rules.unsigned(),
    ]),
    maxK: schema.number.optional([
      rules.unsigned(),
    ]),
  })
}
