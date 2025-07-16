import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateRoleValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    code: schema.string({}, [
			rules.maxLength(4)
		]),
    name: schema.string({}, [
			rules.maxLength(50)
		]),
  })

  public messages = {
    'code.maxLength': 'Role code cannot exceed 4 characters.',
    'name.maxLength': 'Role name cannot exceed 50 characters.',
  }
}
