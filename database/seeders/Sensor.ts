import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Sensor from 'App/Models/Sensor/Sensor';

export default class extends BaseSeeder {
  public async run () {
    await Sensor.createMany([
      {
        sensorName: 'dht'
      },
      {
        sensorName: 'npk-1'
      },
      {
        sensorName: 'npk-2'
      }
    ])
  }
}
