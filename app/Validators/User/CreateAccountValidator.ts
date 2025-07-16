import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Account from 'App/Models/User/Account'
import Role from 'App/Models/User/Role'

export default class CreateAccountValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public reporter = validator.reporters.api

  public schema = schema.create({
    urole_id: schema.string({}, [
      rules.exists({table: Role.table, column: Role.primaryKey})
    ]),
    username: schema.string({}, [
      rules.maxLength(100),
      rules.unique({table: Account.table, column: 'username', where: {deleted_at: null}})
    ]),
    password: schema.string({}, [
      rules.minLength(6)
    ]),
    email: schema.string({}, [
      rules.maxLength(255),
      rules.email(),
      rules.unique({column: 'email', table: Account.table, where: {deleted_at: null}})
    ]),
    google_id: schema.string.optional({}, [
      rules.maxLength(255)
    ]),
    fullname: schema.string({}, [
      rules.maxLength(100)
    ]),
    avatar: schema.string.optional(),
    is_ban: schema.boolean.optional(),
  })

  public messages = {
    'urole_id.exists': 'Role does not exist.',
    'username.maxLength': 'Username cannot exceed 100 characters.',
    'username.unique': 'Username must be unique.',
    'password.minLength': 'Password must be at least 6 characters long.',
    'email.maxLength': 'Email cannot exceed 255 characters.',
    'email.email': 'Email must be a valid email address.',
    'email.unique': 'Email must be unique.',
    'google_id.maxLength': 'Google ID cannot exceed 255 characters.',
    'fullname.maxLength': 'Full name cannot exceed 100 characters.',
  }
}
