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

  /**
   * Arbitrary but stable key identifying this command's advisory lock.
   * Must not collide with other advisory locks taken against the same database.
   */
  private static readonly LOCK_KEY = 4815162342

  public async run() {
    this.logger.info('Starting actuator deactivation check...')

    const Database = (await import('@ioc:Adonis/Lucid/Database')).default
    const mqttClient = (await import('App/Services/Mqtt/MqttService')).default
    const actuatorService = new ActuatorService()

    // This command runs every minute, but a run with failing MQTT retries can
    // take longer than that. Without a lock, overlapping runs both read the same
    // expired rows before either writes its OFF log, producing duplicate OFF
    // commands. A session-scoped advisory lock is released automatically when
    // the connection drops, so a crashed run cannot wedge the lock permanently.
    const lockResult = await Database.rawQuery('SELECT pg_try_advisory_lock(?) AS acquired', [
      ActuatorCheck.LOCK_KEY,
    ])

    if (!lockResult.rows[0]?.acquired) {
      this.logger.info('Another actuator check is still running. Skipping this run.')
      return
    }

    try {
      await mqttClient.waitForConnection(10000)
      await actuatorService.checkAndDeactivate()
      this.logger.success('Actuator check completed successfully.')
    } catch (error) {
      this.logger.error('An error occurred during the actuator check:')
      this.logger.error(error.stack ?? error.message)
    } finally {
      await Database.rawQuery('SELECT pg_advisory_unlock(?)', [ActuatorCheck.LOCK_KEY])
      await mqttClient.close()
    }
  }
}
