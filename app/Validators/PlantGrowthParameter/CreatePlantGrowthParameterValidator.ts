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

  public messages = {
    'plantId.unsigned': 'Plant ID must be a positive number.',
    'plantId.exists': 'Plant ID must exist in the plants table.',
    'growthStageId.unsigned': 'Growth stage ID must be a positive number.',
    'growthStageId.exists': 'Growth stage ID must exist in the growth_stages table.',
    'minAge.unsigned': 'Minimum age must be a positive number.',
    'maxAge.unsigned': 'Maximum age must be a positive number.',
    'minSoilEc.unsigned': 'Minimum soil EC must be a positive number.',
    'maxSoilEc.unsigned': 'Maximum soil EC must be a positive number.',
    'minSoilHumidity.unsigned': 'Minimum soil humidity must be a positive number.',
    'maxSoilHumidity.unsigned': 'Maximum soil humidity must be a positive number.',
  }
}
