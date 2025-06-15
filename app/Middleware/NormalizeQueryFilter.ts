import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NormalizeQueryFilter {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const qs = ctx.request.qs()
    const fieldsToNormalize = ['sensor', 'metric']

    for (const field of fieldsToNormalize) {
      if (qs[field] && typeof qs[field] === 'string') {
        // Split the string by commas and trim whitespace
        qs[field] = [qs[field]]
      }
    }
    // Update the request query with the normalized values
    ctx.request.updateQs(qs)

    await next()
  }
}
