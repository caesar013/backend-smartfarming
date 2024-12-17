import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Table from 'App/Models/Sensor/Table'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    await Table.createMany([
      {
        table_name: 'dhts'
      },
      {
        table_name: 'npks'
      },
      {
        table_name: 'dht_average_dailies'
      },
      {
        table_name: 'npk_average_dailies'
      },
    ])
  }
}
