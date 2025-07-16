import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateSensorValidator {
  constructor(protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    // your validation rules
    name: schema.string.optional({ trim: true }, [
      rules.maxLength(100),
    ]),
    desc: schema.string.optional({ trim: true }),
    publicName: schema.string.optional({ trim: true }, [
      rules.maxLength(100),
      rules.unique({
        table: 'sensors',
        column: 'public_name',
        caseInsensitive: true,
        whereNot: { id: this.ctx.params.id }
      }),
    ]),
    sensorTypeId: schema.number.optional([
      rules.exists({
        table: 'sensor_types',
        column: 'id'
      }),
    ]),
    bedLocationId: schema.number.optional([
      rules.exists({
        table: 'bed_locations',
        column: 'id'
      }),
    ]),
  })

  public messages = {
    'name.maxLength': 'Name cannot exceed 100 characters.',
    'publicName.maxLength': 'Public name cannot exceed 100 characters.',
    'publicName.unique': 'Public name must be unique.',
    'sensorTypeId.exists': 'Sensor type does not exist.',
    'bedLocationId.exists': 'Bed location does not exist.',
  }
}
