import AutomationStatusRepository from 'App/Repositories/AutomationStatus/AutomationStatusRepository'
import AutomationService from '../Automation/AutomationService'

export default class AutomationStatusService {
  private automationStatusRepository: AutomationStatusRepository

  constructor() {
    this.automationStatusRepository = new AutomationStatusRepository()
  }

  /**
   * Method to get the current automation status for a specific system.
   * This method retrieves the status of a system by its name.
   * @param systemName - The name of the system (e.g., 'NUTRITION', 'IRRIGATION').
   * @returns The current status of the system.
   */
  public async getStatus(systemName: string) {
    const row = await this.automationStatusRepository.findBySystem(systemName)
    return row.serialize({
      fields: ['isActive', 'updatedAt'],
    })
  }

  /**
   * Method to set the status of a specific system.
   * This method updates the status of a system by its name.
   * @param systemName - The name of the system (e.g., 'NUTRITION', 'IRRIGATION').
   * @param newStatus - The new status to set (true for active, false for inactive).
   * @returns The updated status of the system.
   */
  public async setStatus(systemName: string, newStatus: boolean) {
    const status = await this.automationStatusRepository.updateStatusBySystem(systemName, newStatus)
    AutomationService.updateCachedState(systemName, newStatus)
    return status
  }
}
