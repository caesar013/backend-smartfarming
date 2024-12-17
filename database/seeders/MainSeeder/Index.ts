import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Application from '@ioc:Adonis/Core/Application'

export default class extends BaseSeeder {
  private async runSeeder(Seeder: { default: typeof BaseSeeder }) {
    /**
     * Do not run when not in a environment specified in Seeder
     */
    if (
      (!Application.inDev)
      || (!Application.inTest)
    ) {
      return
    }

    await new Seeder.default(this.client).run()
  }
  public async run() {
    // Write your database queries inside the run method
    await this.runSeeder(await import('Database/seeders/Table'))
    await this.runSeeder(await import('Database/seeders/Role'))
    await this.runSeeder(await import('Database/seeders/Sensor'))
  }
}
