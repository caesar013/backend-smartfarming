import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  private async runSeeder(Seeder: { default: typeof BaseSeeder }) {
    await new Seeder.default(this.client).run()
  }
  public async run() {
    // Write your database queries inside the run method
    await this.runSeeder(await import('Database/seeders/Role'))
    await this.runSeeder(await import('Database/seeders/Account'))
    await this.runSeeder(await import('Database/seeders/Location'))
    await this.runSeeder(await import('Database/seeders/BedLocation'))
    await this.runSeeder(await import('Database/seeders/SensorType'))
    await this.runSeeder(await import('Database/seeders/Sensor'))
    await this.runSeeder(await import('Database/seeders/ActuatorType'))
    await this.runSeeder(await import('Database/seeders/Plant'))
    await this.runSeeder(await import('Database/seeders/GrowthStage'))
    await this.runSeeder(await import('Database/seeders/PlantGrowthParameter'))
    await this.runSeeder(await import('Database/seeders/Actuator'))
    await this.runSeeder(await import('Database/seeders/PlantingBatch'))
    await this.runSeeder(await import('Database/seeders/Fertilizer'))
    await this.runSeeder(await import('Database/seeders/FertilizerSchedule'))

    await this.runSeeder(await import('Database/seeders/AutomationStatus'))
    await this.runSeeder(await import('Database/seeders/AutomationLog'))
  }
}
