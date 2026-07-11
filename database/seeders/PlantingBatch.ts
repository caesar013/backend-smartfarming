import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PlantingBatch from 'App/Models/PlantingBatch/PlantingBatch'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    const batches = [
      {
        plantId: 1,
        plantingDate: DateTime.fromISO('2025-02-01'),
        locationIds: [1, 2],
      },
      {
        plantId: 2,
        plantingDate: DateTime.fromISO('2025-02-01'),
        locationIds: [1, 2],
      },
      {
        plantId: 3,
        plantingDate: DateTime.fromISO('2026-05-07'),
        locationIds: [1, 2],
      }
    ]

    for (const { locationIds, ...batchData } of batches) {
      const batch = await PlantingBatch.updateOrCreate(
        {
          plantId: batchData.plantId,
          plantingDate: batchData.plantingDate,
        },
        batchData
      )

      await batch.related('locations').sync(locationIds)
    }
  }
}
