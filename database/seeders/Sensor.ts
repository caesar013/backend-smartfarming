import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Sensor from 'App/Models/Sensor/Sensor';

export default class extends BaseSeeder {
  public async run() {
    await Sensor.createMany([
      {
        sensor_name: 'dht',
        table_id: 1
      },
      {
        sensor_name: 'npk_1',
        table_id: 2
      },
      {
        sensor_name: 'npk_2',
        table_id: 2
      }
    ])
  }
}
