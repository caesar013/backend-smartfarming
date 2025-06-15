import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PlantingBatch from 'App/Models/PlantingBatch/PlantingBatch'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    const createdBatches = await PlantingBatch.createMany([
      {
        plantId: 1,
        plantingDate: DateTime.fromISO('2025-02-01'),
      },
      {
        plantId: 2,
        plantingDate: DateTime.fromISO('2025-02-01'),
      }
    ])

    const stroberiBatch = createdBatches.find(batch => batch.plantId === 1)
    const kabochaBatch = createdBatches.find(batch => batch.plantId === 2)

    await stroberiBatch?.related('locations').attach([1, 2])
    await kabochaBatch?.related('locations').attach([1, 2])
  }
}
