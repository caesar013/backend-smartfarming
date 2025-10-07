import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Fertilizer from 'App/Models/Fertilizer/Fertilizer'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await Fertilizer.createMany([
      {
        name: 'NPK',
        nPercentage: 19.0,
        pPercentage: 19.0,
        kPercentage: 19.0,
      },
      {
        name: 'Urea Phosphate',
        nPercentage: 17.0,
        pPercentage: 44.0,
      },
      {
        name: 'Ammonium sulphate',
        nPercentage: 20.5,
      },
      {
        name: 'Urea',
        nPercentage: 46.0,
      },
      {
        name: 'Superphosphate (single)',
        pPercentage: 16.0,
      },
      {
        name: 'Diammonium phosphate',
        nPercentage: 18.0,
        pPercentage: 46.0,
      },
      {
        name: 'Sulphate of potash',
        kPercentage: 48.0,
      },
      {
        name: 'Muriate of potash',
        kPercentage: 60.0,
      },
      {
        name: 'Calcium ammonium nitrate',
        nPercentage: 25.0,
      },
    ])
  }
}
