import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateRoleValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    code: schema.string.optional({}, [
			rules.maxLength(4)
		]),
    name: schema.string.optional({}, [
			rules.maxLength(50)
		]),
  })

  public messages = {
    'code.maxLength': 'Role code cannot exceed 4 characters.',
    'name.maxLength': 'Role name cannot exceed 50 characters.',
    'code.string': 'Role code must be a string.',
    'name.string': 'Role name must be a string.',
  }
}
