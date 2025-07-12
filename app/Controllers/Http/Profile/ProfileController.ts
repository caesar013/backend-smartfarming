import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProfileService from 'App/Services/Profile/ProfileService'
import UpdateProfileValidator from 'App/Validators/Profile/UpdateProfileValidator'

export default class ProfileController {
  private profileService: ProfileService

  constructor() {
    this.profileService = new ProfileService()
  }

  /**
   * show
   * Handle GET /profile
   * Returns the currently authenticated user's profile.
   */
  public async show({ auth, response }: HttpContextContract) {
    // The 'auth' object gives us access to the authenticated user.
    // We assume the user is already loaded by the middleware.
    const user = auth.user!

    // You might want to explicitly load relationships here if needed
    // await user.load('posts')

    return response.ok({
      message: "User profile retrieved successfully.",
      profile: user.serialize() // .serialize() is a good way to convert the model to a plain object
    })
  }


  /**
   * update
   * Handle PUT /profile
   * Updates the authenticated user's profile data.
   */
  public async update({ request, auth, response }: HttpContextContract) {
    // 1. Get the currently authenticated user. The `auth` middleware ensures
    //    `auth.user` is not null. The '!' is a non-null assertion.
    const user = auth.user!

    // 2. Validate the incoming request data against our validator.
    //    If validation fails, AdonisJS automatically throws an exception
    //    and sends a 422 response with the errors.
    const payload = await request.validate(UpdateProfileValidator)

    // 3. Update the user's profile with the validated data.
    const updatedData = await this.profileService.updateProfile(user, payload)

    // 5. Return a success response with the updated user data.
    return response.ok({
      message: "Profile updated successfully!",
      profile: updatedData // Serialize the user model to a plain object
    })
  }
}
