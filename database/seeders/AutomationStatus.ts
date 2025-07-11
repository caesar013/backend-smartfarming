import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import AutomationStatus from 'App/Models/Automation/AutomationStatus'

export default class extends BaseSeeder {
  public async run() {
    await AutomationStatus.createMany([
      {
        system: 'IRRIGATION',
        isActive: true,
      },
      {
        system: 'NUTRITION',
        isActive: true,
      },
    ])
    console.log('AutomationStatusSeeder executed: Default automation status set/updated.')
  }
}
