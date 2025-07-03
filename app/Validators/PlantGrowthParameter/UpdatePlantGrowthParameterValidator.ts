import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePlantGrowthParameterValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    plantId: schema.number.optional([
      rules.unsigned(),
      rules.exists({ table: 'plants', column: 'id' }),
    ]),
    growthStageId: schema.number.optional([
      rules.unsigned(),
      rules.exists({ table: 'growth_stages', column: 'id' }),
    ]),
    minAge: schema.number.optional([
      rules.unsigned(),
    ]),
    maxAge: schema.number.optional([
      rules.unsigned(),
    ]),
    ecMin: schema.number.optional([
      rules.unsigned(),
    ]),
    ecMax: schema.number.optional([
      rules.unsigned(),
    ]),
    moistureMin: schema.number.optional([
      rules.unsigned(),
    ]),
    moistureMax: schema.number.optional([
      rules.unsigned(),
    ]),
  })
}
