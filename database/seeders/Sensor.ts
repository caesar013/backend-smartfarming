import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Sensor from 'App/Models/Sensor/Sensor';

export default class extends BaseSeeder {
  public async run() {
    await Sensor.createMany([
      {
        name: 'dht',
        bedLocationId: null
      },
      {
        name: 'npk_1',
        bedLocationId: 1
      },
      {
        name: 'npk_2',
        bedLocationId: 2
      }
    ])
  }
}
