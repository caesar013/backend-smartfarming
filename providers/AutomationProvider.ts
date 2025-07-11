// providers/AutomationProvider.ts
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AutomationProvider {
  constructor(protected app: ApplicationContract) { }

  public async boot() {
    // We must use dynamic import inside boot to avoid circular dependency issues.
    // This ensures that the services are fully resolved before we use them.
    const AutomationService = (await import('App/Services/Automation/AutomationService')).default
    const AutomationStatusService = (await import('App/Services/AutomationStatus/AutomationStatusService')).default

    // Create a new instance of the status service to pass to the initializer
    const statusServiceInstance = new AutomationStatusService()

    // Initialize the AutomationService state from the database
    await AutomationService.initializeState(statusServiceInstance)
  }
}
