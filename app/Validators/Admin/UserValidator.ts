// app/Validators/UserValidator.ts

import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Validator for inviting a new user.
 * Admin provides basic details, but no password.
 */
export class InviteUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    username: schema.string({ trim: true }, [
      rules.unique({ table: 'user.account', column: 'username' }),
      rules.minLength(4)
    ]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ table: 'user.account', column: 'email' })
    ]),
    fullname: schema.string({ trim: true }, [rules.minLength(3)]),
    frontend_url: schema.string({}, [
      rules.url({ requireTld: false }) // Validates that the URL is well-formed
    ])
  })

  public messages = {
    'required': '{{ field }} tidak boleh kosong',
    'username.unique': 'Username sudah digunakan',
    'email.unique': 'Email sudah terdaftar',
    'email.email': 'Format email tidak valid',
    'minLength': '{{ field }} minimal {{ options.minLength }} karakter',
    'frontend_url.required': 'Frontend URL wajib diisi',
    'frontend_url.url': 'Frontend URL tidak valid'
  }
}

/**
 * Validator for when a user accepts an invitation.
 * Validates the token and the new password.
 */
export class AcceptInvitationValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    token: schema.string({ trim: true }),
    password: schema.string({}, [
      rules.minLength(8),
      rules.confirmed() // Ensures 'password_confirmation' field matches
    ])
  })

  public messages = {
    'required': '{{ field }} tidak boleh kosong',
    'password.minLength': 'Password minimal 8 karakter',
    'password.confirmed': 'Konfirmasi password tidak cocok'
  }
}

/**
 * Validator for updating an existing user's details.
 * All fields are optional.
 */
export class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  // Get user id from route parameter to ignore self in unique checks
  private userId = this.ctx.params.id

  public schema = schema.create({
    username: schema.string.optional({ trim: true }, [
      rules.unique({
        table: 'user.account',
        column: 'username',
        whereNot: { id: this.userId } // Ignore current user
      }),
      rules.minLength(4)
    ]),
    email: schema.string.optional({ trim: true }, [
      rules.email(),
      rules.unique({
        table: 'user.account',
        column: 'email',
        whereNot: { id: this.userId } // Ignore current user
      })
    ]),
    fullname: schema.string.optional({ trim: true }, [rules.minLength(3)]),
    urole_id: schema.string.optional({}, [
      rules.exists({ table: 'user.role', column: 'id' }) // Ensure role exists
    ]),
  })

  public messages = {
    'username.unique': 'Username sudah digunakan',
    'email.unique': 'Email sudah terdaftar',
    'email.email': 'Format email tidak valid',
    'minLength': '{{ field }} minimal {{ options.minLength }} karakter',
    'urole_id.exists': 'Role yang dipilih tidak valid',
  }
}

/**
 * Validator for updating a user's ban status.
 */
export class BanUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    is_ban: schema.boolean()
  })

  public messages = {
    'is_ban.required': 'Status ban harus ditentukan (true atau false)',
    'is_ban.boolean': 'Status ban harus boolean (true atau false)'
  }
}
