import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Sensor from 'App/Models/Sensor/Sensor';

export default class extends BaseSeeder {
  public async run() {
    await Sensor.createMany([
      {
        name: 'dht',
        publicName: 'dht',
        sensorTypeId: 2,
        bedLocationId: null
      },
      {
        name: 'npk_1',
        publicName: 'npk1',
        sensorTypeId: 1,
        bedLocationId: 1
      },
      {
        name: 'npk_2',
        publicName: 'npk2',
        sensorTypeId: 1,
        bedLocationId: 2
      }
    ])
  }
}
