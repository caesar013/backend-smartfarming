import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateFertilizerValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    plantGrowthParameterId: schema.number([
      rules.unsigned(),
      rules.exists({ table: 'plant_growth_parameters', column: 'id' }),
    ]),
    fertilizerId: schema.number([
      rules.unsigned(),
      rules.exists({ table: 'fertilizers', column: 'id' }),
    ]),
    dayOfApplication: schema.number([
      rules.unsigned(),
    ]),
    amount: schema.number([
      rules.unsigned(),
    ]),
    unit: schema.string({ trim: true }, [
      rules.maxLength(50),
    ]),
  })

  public messages = {
    'plantGrowthParameterId.unsigned': 'Plant Growth Parameter ID must be a positive number.',
    'plantGrowthParameterId.exists': 'Plant Growth Parameter ID does not exist.',
    'fertilizerId.unsigned': 'Fertilizer ID must be a positive number.',
    'fertilizerId.exists': 'Fertilizer ID does not exist.',
    'dayOfApplication.unsigned': 'Day Of Application must be a positive number.',
    'amount.unsigned': 'Amount must be a positive number.',
    'unit.maxLength': 'Unit cannot exceed 50 characters.',
  }
}
