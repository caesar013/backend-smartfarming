import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import Account from 'App/Models/Account'

export default class Invitation extends BaseMailer {
  constructor (private user: Account, private token: string, private frontendUrl: string) {
    super()
  }
  /**
   * URL for the user to set up their password.
   * This URL will be used in the email template.
   */
  private setupPasswordUrl = `${this.frontendUrl}/accept-invitation?token=${this.token}`

  public prepare(message: MessageContract) {
    message
      .subject('Anda diundang untuk bergabung!')
      .from('no-reply@your-app.com', 'Smart Farming')
      .to(this.user.email)
      .htmlView('emails/invitation', {
        user: this.user,
        url: this.setupPasswordUrl
      })
  }
}
