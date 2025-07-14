import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreatePlantingBatchValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    plantId: schema.number([
      rules.exists({ table: 'plants', column: 'id' }),
    ]),
    plantingDate: schema.date({
      format: 'yyyy-MM-dd',
    }),
    harvestDate: schema.date.optional({
      format: 'yyyy-MM-dd',
    }, [
      rules.afterField('plantingDate'),
    ]),
  })
}
