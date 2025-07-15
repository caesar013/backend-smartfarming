import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import GrowthStage from 'App/Models/GrowthStage/GrowthStage'

export default class extends BaseSeeder {
  public async run() {
    await GrowthStage.createMany([
      {
        name: 'Vegetative',
        order: 1,
        description: 'The vegetative stage is the period of growth before flowering, where the plant focuses on developing leaves and stems.'
      },
      {
        name: 'Flowering',
        order: 2,
        description: 'The flowering stage is when the plant produces flowers, which are essential for reproduction.'
      },
      {
        name: 'Generative',
        order: 3,
        description: 'The Generative stage is when the plant develops fruits, which contain seeds for the next generation.'
      },
    ])
  }
}
