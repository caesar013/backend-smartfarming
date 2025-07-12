import Hash from '@ioc:Adonis/Core/Hash'
import ProfileRepository from "App/Repositories/Profile/ProfileRepository";

export default class ProfileService {
  private profileRepository: ProfileRepository

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  /**
   * Update the user's profile with the provided data.
   * @param user - The user model instance to update.
   * @param data - The data to update the user's profile with.
   */
  public async updateProfile(user: any, data: any) {
    const updatedData = await this.profileRepository.updateUserProfile(user, data)

    return updatedData.serialize() // Serialize the user model to a plain object
  }

  /**
   * Change the user's password.
   * @param user - The user model instance.
   * @param data - The data containing the new password.
   */
  public async changePassword(user: any, data: any) {
    // Hash the new password before saving it.
    const hashedPassword = await Hash.make(data.newPassword)

    await this.profileRepository.updateUserPassword(user, hashedPassword)
  }
}
