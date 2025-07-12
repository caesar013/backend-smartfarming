import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateProfileValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string([ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string([
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    fullName: schema.string.optional({ trim: true }, [
      rules.maxLength(100)
    ]),

    // Optional: User's email
    email: schema.string.optional({ trim: true }, [
      rules.email(),
      // The email must be unique in the 'users' table,
      // but we ignore the current user's record.
      rules.unique({
        table: 'user.account',
        column: 'email',
        caseInsensitive: true,
        whereNot: { id: this.ctx.auth.user?.id }
      }),
      rules.maxLength(255)
    ]),

    // Optional: User's username
    // Note: The username is not required to be unique in this case,
    // but it should not exceed a certain length.
    username: schema.string.optional({ trim: true }, [
      rules.maxLength(100),
      rules.unique({
        table: 'user.account',
        column: 'username',
        caseInsensitive: true,
        whereNot: { id: this.ctx.auth.user?.id }
      })
    ])
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   */
  public messages: CustomMessages = {
    'fullName.maxLength': 'Your name cannot be longer than 180 characters.',
    'email.email': 'Please provide a valid email address.',
    'email.unique': 'This email address is already in use by another account.',
    'email.maxLength': 'The email address cannot be longer than 255 characters.',
    'username.maxLength': 'Your username cannot exceed 500 characters.'
  }
}
