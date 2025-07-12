import Database from "@ioc:Adonis/Lucid/Database";
import Invitation from "App/Models/Invitation/Invitation";
import Account from "App/Models/User/Account"
import { DateTime } from "luxon";
import { v4 as uuidv4 } from 'uuid';

export default class UserRepository {

  /**
   * Get all users with their roles.
   * @returns Array of Accounts
   */
  public async findAll() {
    return Account.query().preload('role').orderBy('created_at', 'desc')
  }

  /**
   * Searches for a single user by username.
   * Will throw an exception if not found.
   * @param username - username of the user
   * @returns Single Account object
   */
  public async findByUsername(username: string) {
    return Account.query().where('username', username).preload('role').firstOrFail()
  }

  /**
   * Searches for a single user by email.
   * Will return null if not found.
   * @param email - Email of the user
   * @returns Single Account object or null
   */
  public async findByEmail(email: string) {
    return Account.query().where('email', email).first();
  }

  /**
   * Creates a new user in the database.
   * @param data - Data for the new user
   * @returns Account object of the newly created user
   */
  public async create(data: Partial<Account>) {
    return Account.create(data);
  }

  /**
   * Updates user data based on username.
   * Update user data with the provided partial data.
   * @param username - Username of the user to update
   * @param data - New data for the user
   * @returns Account object that has been updated
   */
  public async createWithInvitation(data: Partial<Account>) {
    let user: Account | null = null
    let token: string | null = null
    const invitationToken = uuidv4()

    // Using a transaction to ensure data integrity
    await Database.transaction(async (trx) => {
      // 1. For new user, use transaction
      const account = new Account()
      account.useTransaction(trx)
      account.fill(data)
      account.google_id = data.google_id || "1" // Ensure google_id is set to null if not provided
      await account.save()
      user = account

      // 2. Create invitation record for the user
      const invitation = new Invitation()
      invitation.useTransaction(trx)
      invitation.userId = user.id
      invitation.token = invitationToken
      invitation.expiresAt = DateTime.now().plus({ hours: 24 }) // Token expires in 24 hours
      await invitation.save()
      token = invitation.token // Store the token to return it later
    })

    // Return the newly created user and token
    if (!user || !token) {
      throw new Error('User or invitation token was not created.')
    }
    return { user, token }
  }

  /**
   * Finds an invitation by its token.
   * @param token - The invitation token
   * @returns The invitation object or null
   */
  public async findInvitationByToken(token: string) {
    return Invitation.query()
      .where('token', token)
      .where('expiresAt', '>', DateTime.now().toSQL()) // Check if the token has not expired
      .preload('user') // Include the related user data
      .first()
  }

  /**
   * Sets the password for a user and deletes the invitation.
   * This method is used when a user accepts an invitation and sets their password.
   * It will hash the password before saving it.
   * @param invitation - The invitation object containing the user
   * @param password - The new password for the user
   */
  public async setPasswordAndActivate(invitation: Invitation, password: string) {
    await Database.transaction(async (trx) => {
      // 1. Grab the user from the invitation relation
      const user = invitation.user
      user.useTransaction(trx)
      user.password = password // Set hashed password
      await user.save()

      // 2. Delete the invitation after it has been used
      await invitation.useTransaction(trx).delete()
    })
  }

  /**
   * Updates user data based on username.
   * Business logic:
   * 1. If there is a new password, hash the password.
   * @param username - username of the user
   * @param data - Data from the validated request
   * @returns Account object that has been updated
   */
  public async update(username: string, data: Partial<Account>) {
    const user = await this.findByUsername(username)
    user.merge(data)
    await user.save()
    return user
  }

  /**
   * Do a soft delete on the user by username.
   * @param username - username of the user to delete
   */
  public async delete(username: string) {
    const user = await this.findByUsername(username)
    // Model has been configured for soft delete,
    // so the delete() method will fill the deleted_at column.
    await user.delete()
  }

  /**
   * Updates the ban status of a user.
   * @param username - username of the user
   * @param isBanned - Ban status (true/false)
   * @returns Account object that has been updated
   */
  public async updateBanStatus(username: string, isBanned: boolean) {
    const user = await this.findByUsername(username)
    user.is_ban = isBanned
    await user.save()
    return user
  }
}
