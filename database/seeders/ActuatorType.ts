import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ActuatorType from 'App/Models/ActuatorType/ActuatorType'

export default class extends BaseSeeder {
  public async run() {
    await ActuatorType.createMany([
      {
        type: 'Water Pump',
        description: 'Used to pump water for irrigation',
      },
      {
        type: 'Solenoid Valve',
        description: 'Used to control the flow of water in irrigation systems',
      }
    ])
  }
}
