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

    // Add validation for the locations array
    locations: schema.array([
      rules.minLength(1) // Ensure at least one location is selected
    ]).members(
      schema.number([
        rules.exists({ table: 'bed_locations', column: 'id' }) // Ensure each ID exists
      ])
    )
  })

  public messages = {
    'plantId.exists': 'Plant ID must exist in the plants table.',
    'plantingDate.date': 'Planting date must be a valid date in the format yyyy-MM-dd.',
    'harvestDate.date': 'Harvest date must be a valid date in the format yyyy-MM-dd.',
    'harvestDate.afterField': 'Harvest date must be after planting date.',
    'locations.minLength': 'At least one location must be selected.',
    'locations.*.exists': 'Each location ID must exist in the bed_locations table.'
  }
}
