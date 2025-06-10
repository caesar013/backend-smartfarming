import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PlantingBatch from 'App/Models/PlantingBatch/PlantingBatch'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    await PlantingBatch.createMany([
      {
        plantId: 1,
        bedLocationId: 1,
        plantingDate: DateTime.fromISO('2025-02-01'),
      },
      {
        plantId: 2,
        bedLocationId: 2,
        plantingDate: DateTime.fromISO('2025-02-01'),
      }
    ])
  }
}
