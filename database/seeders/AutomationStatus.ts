import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import AutomationStatus from 'App/Models/Automation/AutomationIrrigationStatus'

export default class extends BaseSeeder {
  public async run() {
    await AutomationStatus.updateOrCreate(
      {},
      {
        isActive: true
      }
    )
    console.log('AutomationStatusSeeder executed: Default automation status set/updated.')
  }
}
