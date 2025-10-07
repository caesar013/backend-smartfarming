import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Fertilizer from 'App/Models/Fertilizer/Fertilizer'
import FertilizerSchedule from 'App/Models/FertilizerSchedule/FertilizerSchedule'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method

    const npk = await Fertilizer.findByOrFail('name', 'NPK')
    const ureaPhosphate = await Fertilizer.findByOrFail('name', 'Urea Phosphate')
    const urea = await Fertilizer.findByOrFail('name', 'Urea')
    const muriateOfPotash = await Fertilizer.findByOrFail('name', 'Muriate of potash')
    const sulphateOfPotash = await Fertilizer.findByOrFail('name', 'Sulphate of potash')

    console.log('Fertilizers fetched for seeding fertilizer schedules.')
    console.log({ npk, ureaPhosphate, urea, muriateOfPotash, sulphateOfPotash });
    // 2. Create the schedule records with the specific application day
    await FertilizerSchedule.createMany([
      // --- Schedule for Stage 1 (6-35 days) ---
      {
        plantGrowthParameterId: 1,
        fertilizerId: npk.id,
        dayOfApplication: 6,
        amount: 33.62,
        unit: 'kg/acre',
      },
      {
        plantGrowthParameterId: 1,
        fertilizerId: ureaPhosphate.id,
        dayOfApplication: 6,
        amount: 41,
        unit: 'kg/acre',
      },
      {
        plantGrowthParameterId: 1,
        fertilizerId: urea.id,
        dayOfApplication: 6,
        amount: 26.65,
        unit: 'kg/acre',
      },

      // --- Schedule for Stage 2 (36-60 days) ---
      {
        plantGrowthParameterId: 2,
        fertilizerId: npk.id,
        dayOfApplication: 40,
        amount: 33.6,
        unit: 'kg/acre',
      },
      {
        plantGrowthParameterId: 2,
        fertilizerId: ureaPhosphate.id,
        dayOfApplication: 40,
        amount: 14,
        unit: 'kg/acre',
      },
      {
        plantGrowthParameterId: 2,
        fertilizerId: urea.id,
        dayOfApplication: 40,
        amount: 4.6,
        unit: 'kg/acre',
      },

      // --- Schedule for Stage 3 (61-90 days) ---
      {
        plantGrowthParameterId: 3,
        fertilizerId: muriateOfPotash.id,
        dayOfApplication: 61,
        amount: 38.3,
        unit: 'kg/acre',
      },
      {
        plantGrowthParameterId: 3,
        fertilizerId: sulphateOfPotash.id,
        dayOfApplication: 61,
        amount: 33,
      },
      {
        plantGrowthParameterId: 3,
        fertilizerId: urea.id,
        dayOfApplication: 61,
        amount: 39.8,
        unit: 'kg/acre',
      },
      {
        plantGrowthParameterId: 3,
        fertilizerId: npk.id,
        dayOfApplication: 61,
        amount: 26.1,
        unit: 'kg/acre',
      },
      {
        plantGrowthParameterId: 3,
        fertilizerId: ureaPhosphate.id,
        dayOfApplication: 61,
        amount: 6.3,
        unit: 'kg/acre',
      }
    ])
  }
}
