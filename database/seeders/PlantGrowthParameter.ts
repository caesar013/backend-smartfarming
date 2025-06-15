import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PlantGrowthParameter from 'App/Models/PlantGrowthParameter/PlantGrowthParameter'

export default class extends BaseSeeder {
  public async run() {
    await PlantGrowthParameter.createMany([
      {
        plantId: 1,
        growthStageId: 1,
        minAge: 0,
        maxAge: 30,
        minN: 10,
        maxN: 20,
        minP: 5,
        maxP: 10,
        minK: 5,
        maxK: 10,
      },
      {
        plantId: 1,
        growthStageId: 2,
        minAge: 31,
        maxAge: 60,
        minN: 20,
        maxN: 30,
        minP: 10,
        maxP: 20,
        minK: 10,
        maxK: 20,
      },
      {
        plantId: 1,
        growthStageId: 3,
        minAge: 61,
        maxAge: 90,
        minN: 30,
        maxN: 40,
        minP: 20,
        maxP: 30,
        minK: 20,
        maxK: 30,
      },
      {
        plantId: 2,
        growthStageId: 1,
        minAge: 0,
        maxAge: 30,
        minN: 15,
        maxN: 25,
        minP: 10,
        maxP: 15,
        minK: 10,
        maxK: 15,
      },
      {
        plantId: 2,
        growthStageId: 2,
        minAge: 31,
        maxAge: 60,
        minN: 25,
        maxN: 35,
        minP: 15,
        maxP: 25,
        minK: 15,
        maxK: 25,
      },
      {
        plantId: 2,
        growthStageId: 3,
        minAge: 61,
        maxAge: 90,
        minN: 35,
        maxN: 45,
        minP: 25,
        maxP: 35,
        minK: 25,
        maxK: 35
      }
    ])
  }
}
