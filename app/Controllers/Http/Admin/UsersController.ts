import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from 'App/Services/Admin/UserService'
// Import the updated and new validators
import { InviteUserValidator, UpdateUserValidator, BanUserValidator, AcceptInvitationValidator } from 'App/Validators/Admin/UserValidator'

/**
 * UsersController handles all incoming HTTP requests for the 'user' resource.
 */
export default class UsersController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  /**
   * GET /users
   * Displays a list of all users.
   * (This method remains the same)
   */
  public async index({ response }: HttpContextContract) {
    try {
      const users = await this.userService.all();
      return response.ok({ message: "Data fetched successfully", data: users });
    } catch (error) {
      return response.internalServerError({ message: "An error occurred", error: error.message });
    }
  }

  /**
   * POST /users
   * Invites a new user by creating an account and sending an invitation email.
   * This method was previously 'store'.
   */
  public async store({ request, response }: HttpContextContract) {
    try {
      // 1. Use the new InviteUserValidator
      const payload = await request.validate(InviteUserValidator);
      // 2. Call the 'invite' method in the service
      const newUser = await this.userService.invite(payload);
      // 3. Update the success message
      return response.created({ message: "User invited successfully", data: newUser });
    } catch (error) {
      if (error.messages) {
        return response.badRequest({ message: "Validation failed", errors: error.messages });
      }
      return response.internalServerError({ message: "An error occurred", error: error.message });
    }
  }

  /**
   * POST /users/accept-invitation
   * A new public endpoint for a user to set their password using a token.
   */
  public async acceptInvitation({ request, response }: HttpContextContract) {
    try {
      const payload = await request.validate(AcceptInvitationValidator);
      const result = await this.userService.acceptInvitation(payload);
      return response.ok(result);
    } catch (error) {
      if (error.messages) {
        return response.badRequest({ message: "Validation failed", errors: error.messages });
      }
      // Handle specific error for invalid/expired tokens
      if (error.code === 'E_INVALID_INVITATION_TOKEN') {
        return response.status(404).send({ message: error.message });
      }
      return response.internalServerError({ message: "An error occurred", error: error.message });
    }
  }


  /**
   * GET /users/:username
   * Displays a single user's details.
   * (This method remains the same)
   */
  public async show({ params, response }: HttpContextContract) {
    try {
      const user = await this.userService.findByUsername(params.id) // Assuming 'id' is actually the username in this context
      return response.ok({ message: "User found", data: user })
    } catch (error) {
      return response.notFound({ message: "User not found" })
    }
  }

  /**
   * PUT /users/:id(username)
   * Updates a user's data.
   */
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const payload = await request.validate(UpdateUserValidator)
      const updatedUser = await this.userService.update(params.id, payload)
      return response.ok({ message: "User updated successfully", data: updatedUser })
    } catch (error) {
      if (error.messages) {
        return response.badRequest({ message: "Validation failed", errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: "User not found" })
      }
      return response.internalServerError({ message: "An error occurred", error: error.message })
    }
  }

  /**
   * DELETE /users/:id(username)
   * Deletes a user (soft delete).
   */
  public async destroy({ params, response }: HttpContextContract) {
    try {
      await this.userService.destroy(params.id)
      return response.ok({ message: "User deleted successfully" })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: "User not found" })
      }
      return response.internalServerError({ message: "An error occurred", error: error.message })
    }
  }

  /**
   * PATCH /users/:id(username)/ban
   * Updates a user's ban status.
   */
  public async ban({ params, request, response }: HttpContextContract) {
    try {
      const payload = await request.validate(BanUserValidator)
      const user = await this.userService.ban(params.id, payload)
      return response.ok({ message: "User ban status updated", data: user })
    } catch (error) {
      if (error.messages) {
        return response.badRequest({ message: "Validation failed", errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: "User not found" })
      }
      return response.internalServerError({ message: "An error occurred", error: error.message })
    }
  }
}
