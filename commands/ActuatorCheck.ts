import { BaseCommand } from '@adonisjs/core/build/standalone'
import ActuatorService from 'App/Services/Actuator/ActuatorService'

export default class ActuatorCheck extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'actuator:check'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Checks for actuators past their turn-off time and deactivates them'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    this.logger.info('Starting actuator deactivation check...')

    const actuatorService = new ActuatorService()
    try {
      await actuatorService.checkAndDeactivate()
      this.logger.success('Actuator check completed successfully.')
    } catch (error) {
      this.logger.error('An error occurred during the actuator check:')
      this.logger.error(error)
    }
  }
}
