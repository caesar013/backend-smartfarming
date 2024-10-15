import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Sensor from 'App/Models/Sensor/Sensor';

export default class extends BaseSeeder {
  public async run () {
    await Sensor.createMany([
      {
        sensor_name: 'dht'
      },
      {
        sensor_name: 'npk-1'
      },
      {
        sensor_name: 'npk-2'
      }
    ])
  }
}
