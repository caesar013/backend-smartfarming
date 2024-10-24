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
      }
    ])
  }
}
