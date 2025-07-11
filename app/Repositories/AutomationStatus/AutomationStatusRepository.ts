import AutomationStatus from 'App/Models/Automation/AutomationStatus'

export default class AutomationStatusRepository {

  /**
   * Get an automation status by system name.
   * @param systemName - Nama sistem (misalnya, 'NUTRITION')
   */
  public async findBySystem(systemName: string) {
    const status = await this.findBy('system', systemName)
    return status
  }

  /**
   * Update the status by system name.
   * @param systemName - System name (e.g., 'NUTRITION')
   * @param newStatus - New status (true or false)
   * @returns The updated status object
   * @throws If the system does not exist or if the update fails
   */
  public async updateStatusBySystem(systemName: string, newStatus: boolean) {
    const status = await this.findBySystem(systemName)
    if (!status) {
      throw new Error(`Automation status for system '${systemName}' not found.`)
    }
    status.isActive = newStatus
    await status.save()
    return status
  }

  /**
   * Method to get automation status by a specific column.
   * @param columnName - The name of the column to filter by (e.g., 'system')
   * @param columnValue - The value of the column to filter by (e.g., 'NUTRITION')
   * @returns The automation status object
   */
  public async findBy(columnName: string, columnValue: string) {
    const status = await AutomationStatus.query().where(columnName, columnValue).first()
    if (!status) {
      throw new Error(`Automation status with ${columnName} '${columnValue}' not found.`)
    }
    return status
  }
}
