import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AutomationStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    isActive: schema.boolean(),
  })

  /**
   * Custom messages for validation errors.
   * You can override the default messages here.
   */
  public messages: CustomMessages = {
    'isActive.required': 'Status isActive wajib diisi.',
    'isActive.boolean': 'Status isActive harus berupa true atau false.',
  }
}
