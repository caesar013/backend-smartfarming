import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateLocationValidator {
  constructor(protected ctx: HttpContextContract) { }

  /**
   * Defines the validation schema.
   * - publicName, latitude, and longitude are required.
   * - address is optional.
   */
  public schema = schema.create({
    publicName: schema.string([
      rules.trim(),
      rules.maxLength(100)
    ]),
    address: schema.string.optional([
      rules.trim()
    ]),
    latitude: schema.number(),
    longitude: schema.number(),
  })

  /**
   * Custom messages for validation failures. You can add more custom messages here.
   */
  public messages: CustomMessages = {
    'publicName.required': 'A public name for the location is required.',
    'publicName.maxLength': 'The public name cannot be longer than 100 characters.',
    'latitude.required': 'A latitude value is required.',
    'longitude.required': 'A longitude value is required.',
    '*.number': 'The {{ field }} must be a valid number.',
  }
}
