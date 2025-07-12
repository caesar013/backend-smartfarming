export default class ProfileRepository {
  /**
   * Update the user's profile with the provided data.
   * @param user - The user model instance to update.
   * @param data - The data to update the user's profile with.
   * @return A promise that resolves when the update is complete.
   */
  public async updateUserProfile(user: any, data: any) {
    // Merge the validated payload into the user model instance.
    // `merge` only updates the fields present in the payload.
    user.merge(data)

    // Persist the changes to the database.
    await user.save()

    // Optionally, you can return the updated user instance
    return user
  }

  /**
   * Change the user's password.
   * @param user - The user model instance.
   * @param data - The data containing the new password.
   * @return A promise that resolves when the password is changed.
   */
  public async updateUserPassword(user: any, password: string) {
    // Update the user's password.
    user.password = password

    // Save the changes to the database.
    await user.save()
  }
}
