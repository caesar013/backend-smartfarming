import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'

export default class AdminAuth {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    // Ensure the user is authenticated first
    await auth.use('api').authenticate()

    // Get the user object
    const user = auth.use('api').user!

    // Preload the role relationship from your User model
    // This assumes your User model has a 'role' relationship defined
    await user.load('role')

    // Check if the user's role code is 'ADMN'
    if (user.role.code !== 'ADMN') {
      // If not an admin, throw a standard authentication exception
      throw new AuthenticationException(
        'Unauthorized access',
        'E_UNAUTHORIZED_ACCESS',
        'api',
      )
    }

    // If the check passes, continue to the controller
    await next()
  }
}
