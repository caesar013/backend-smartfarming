import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PlantGrowthParameter from 'App/Models/PlantGrowthParameter/PlantGrowthParameter'

export default class extends BaseSeeder {
  public async run() {
    await PlantGrowthParameter.createMany([
      {
        plantId: 1,
        growthStageId: 1,
        minAge: 0,
        maxAge: 40,
        minSoilEc: 700,
        maxSoilEc: 1000,
        minSoilHumidity: 40,
        maxSoilHumidity: 60,
        minPh: 5.4,
        maxPh: 6.5,
      },
      {
        plantId: 1,
        growthStageId: 2,
        minAge: 41,
        maxAge: 60,
        minSoilEc: 700,
        maxSoilEc: 1000,
        minSoilHumidity: 40,
        maxSoilHumidity: 60,
        minPh: 5.4,
        maxPh: 6.5,
      },
      {
        plantId: 1,
        growthStageId: 3,
        minAge: 61,
        maxAge: 180,
        minSoilEc: 700,
        maxSoilEc: 1000,
        minSoilHumidity: 40,
        maxSoilHumidity: 60,
        minPh: 5.4,
        maxPh: 6.5,
      },
      {
        plantId: 2,
        growthStageId: 1,
        minAge: 0,
        maxAge: 30,
        minSoilEc: 1000,
        maxSoilEc: 1200,
        minSoilHumidity: 40,
        minPh: 5.8,
        maxPh: 6.5,
      },
      {
        plantId: 2,
        growthStageId: 2,
        minAge: 31,
        maxAge: 60,
        minSoilEc: 1000,
        minSoilHumidity: 30,
        minPh: 5.8,
        maxPh: 6.5,
      },
      {
        plantId: 2,
        growthStageId: 3,
        minAge: 61,
        maxAge: 90,
        minSoilEc: 1000,
        minSoilHumidity: 30,
        minPh: 5.8,
        maxPh: 6.5,
      }
    ])
  }
}
