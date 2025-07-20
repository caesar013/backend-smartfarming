import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateLocationValidator {
  constructor(protected ctx: HttpContextContract) {}

  /**
   * Defines the validation schema for updates.
   * All fields are optional.
   */
  public schema = schema.create({
    publicName: schema.string.optional([
      rules.trim(),
      rules.maxLength(100)
    ]),
    address: schema.string.optional([
      rules.trim()
    ]),
    latitude: schema.number.optional(),
    longitude: schema.number.optional(),
  })

  /**
   * Custom messages for validation failures. You can add more custom messages here.
   */
  public messages: CustomMessages = {
    'publicName.maxLength': 'The public name cannot be longer than 100 characters.',
    '*.number': 'The {{ field }} must be a valid number.',
  }
}
