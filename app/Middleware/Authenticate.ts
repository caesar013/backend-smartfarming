import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Authenticate {
  public async handle({auth, response}: HttpContextContract, next: () => Promise<void>) {
    await auth.use('api').check();

    if(!auth.isAuthenticated){
      return response.unauthorized({success: false, message: 'Unauthorized!'});
    }
    await next()
  }
}
