import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreatePlantGrowthParameterValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    plantId: schema.number([
      rules.unsigned(),
      rules.exists({ table: 'plants', column: 'id' }),
    ]),
    growthStageId: schema.number([
      rules.unsigned(),
      rules.exists({ table: 'growth_stages', column: 'id' }),
    ]),
    minAge: schema.number([
      rules.unsigned(),
    ]),
    maxAge: schema.number.optional([
      rules.unsigned(),
    ]),
    minSoilEc: schema.number([
      rules.unsigned(),
    ]),
    maxSoilEc: schema.number.optional([
      rules.unsigned(),
    ]),
    minSoilHumidity: schema.number([
      rules.unsigned(),
    ]),
    maxSoilHumidity: schema.number.optional([
      rules.unsigned(),
    ]),
  })
}
