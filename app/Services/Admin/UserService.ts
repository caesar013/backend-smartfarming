import Hash from '@ioc:Adonis/Core/Hash'
import Role from 'App/Models/User/Role';
import UserRepository from "App/Repositories/Admin/UserRepository";
import InvitationMailer from 'App/Mailers/Invitation';
import { Exception } from '@adonisjs/core/build/standalone';

export default class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get all users with their roles.
   * @returns Array of Accounts
   */
  public async all() {
    return this.userRepository.findAll()
  }

  /**
   * Searches for a single user by username.
   * @param username - username of the user
   */
  public async findByUsername(username: string) {
    return this.userRepository.findByUsername(username)
  }

  /**
   * Invites a new user by creating an invitation.
   * @param data - Data from the validated request
   */
  public async invite(data: any) {
    // 1. Get the 'USER' role from the database to set as default
    const userRole = await Role.findByOrFail('code', 'USER')
    data.urole_id = userRole.id
    // 2. get the frontend URL from the data or environment variable
    const { frontend_url, ...accountData } = data

    // 3. Call the repository to create a new user with an invitation
    const { user, token } = await this.userRepository.createWithInvitation(accountData)

    // 4. Send email with the generated token
    await new InvitationMailer(user, token, frontend_url).send()

    return user
  }

  /**
   * Accepts an invitation by setting the user's password.
   * @param data - Object containing the invitation token and new password
   * @param data.token - The invitation token
   * @param data.password - The new password to set for the user
   * @returns { message: string } - Confirmation message
   * @throws { Exception } - If the invitation token is invalid or has expired
   */
  public async acceptInvitation(data: { token: string, password: string }) {
    // 1. Find a valid invitation using the token
    const invitation = await this.userRepository.findInvitationByToken(data.token)

    // 2. If the invitation is not found or has expired, throw an error
    if (!invitation) {
      throw new Exception("Invitation token is invalid or has expired.", 404, "E_INVALID_INVITATION_TOKEN")
    }

    // 3. Hash the new password provided by the user
    const hashedPassword = await Hash.make(data.password)

    // 4. Set the password and activate the user account
    await this.userRepository.setPasswordAndActivate(invitation, hashedPassword)

    return { message: "Password has been set successfully. You can now log in." }
  }

  /**
   * Updates user data based on username.
   * @param username - Username of the user
   * @param data - Data from the validated request
   */
  public async update(username: string, data: any) {
    // If there is a new password, hash the password.
    if (data.password) {
      data.password = await Hash.make(data.password)
    }
    return this.userRepository.update(username, data)
  }

  /**
   * Do a soft delete on the user by username.
   * @param username - Username of the user
   */
  public async destroy(username: string) {
    return this.userRepository.delete(username)
  }

  /**
   * Updates the ban status of a user.
   * @param username - Username of the user
   * @param payload - { is_ban: boolean }
   */
  public async ban(username: string, payload: { is_ban: boolean }) {
    return this.userRepository.updateBanStatus(username, payload.is_ban)
  }
}
