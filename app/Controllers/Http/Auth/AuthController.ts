import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthService from 'App/Services/Auth/AuthService'
import AccountService from 'App/Services/User/AccountService'
import Base64 from 'base-64'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
  service = new AuthService()
  accountService = new AccountService()

  public async login({ auth, request, response }: HttpContextContract) {
    try {
      const credentials = this.getBasicAuth(request.header('authorization'))
      const rememberMe = request.body().remember_me ?? false
      const token = await this.service.login(credentials, auth, rememberMe)
      return response.api(token, 'OK', 200, request)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async register({ request, response }: HttpContextContract) {
    try {
      const registerValidation = schema.create({
        username: schema.string({}, [
          rules.maxLength(25),
          rules.unique({ table: 'user.account', column: 'username' }),
        ]),
        password: schema.string({}, [
          rules.minLength(8)
        ]),
        email: schema.string({}, [
          rules.email(),
          rules.unique({ table: 'user.account', column: 'email' }),
        ]),
        fullname: schema.string(),
      });

      const payload = await request.validate({ schema: registerValidation });

      const store = await this.accountService.createAccount(payload);

      if (!store?.success) {
        return response.unprocessableEntity({
          success: false,
          message: store?.message
        });
      }

      return response.created({
        success: store.success,
        message: store.message
      });
    } catch (e) {
      let message = Object.keys(e.messages)[0] + ": " + e.messages[Object.keys(e.messages)[0]]

      return response.internalServerError({
        success: false,
        message
      });
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    try {
      await auth.use('api').revoke()
      return response.api(null, 'Logout successful!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async oauthRedirect({ ally, response }) {
    try {
      return ally.use('google').redirect()
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async oauthCallback({ ally, auth, response }) {
    try {
      const google = await ally.use('google').user()
      let user = await this.accountService.findByEmail(google.email)
      if (!user) {
        return response.error('akun tidak terdaftar')
      } else {
        if (!user.google_id) {
          await this.accountService.update(user.id, {
            google_id: google.id,
            status: true
          })
        }
        await user.load('role')
        const authResult = await this.service.generateToken(auth, user, true)
        const encodeToken = Base64.encode(JSON.stringify(authResult))
        return response.redirect().toPath(`http://localhost:4200/google-redirect?token=${encodeToken}`)
      }
    } catch (error) {
      return response.error(error.message)
    }
  }
  public async forgotPassword({ request, response }) {
    try {
      const data = await request.all()
      await this.service.forgotPassword(data.credential, request)
      return response.api(null, 'Forgot password link has been sent to your email')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async restorePassword({ request, response }) {
    try {
      const data = await request.all()
      await this.service.restorePassword(data)
      return response.api(null, 'Password restored!')
    } catch (error) {
      return response.error(error.message)
    }
  }
  getBasicAuth(authHeader: any) {
    const data = Base64.decode(authHeader.split(' ')[1]).split(':')
    return { email: data[0], password: data[1] }
  }

  public async me({ auth, response }: HttpContextContract) {
    try {
      const user = await auth.authenticate()
      await user.load('role')
      return response.api(user, 'User data retrieved successfully')
    } catch (error) {
      return response.error(error.message)
    }
  }
}
