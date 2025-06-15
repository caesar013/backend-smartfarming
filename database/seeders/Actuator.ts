import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Actuator from 'App/Models/Actuator/Actuator'

export default class extends BaseSeeder {
  public async run() {
    await Actuator.createMany([

      {
        name: 'Valve 1',
        actuatorTypeId: 2,
        bedLocationId: 1,
      },
      {
        name: 'Valve 2',
        actuatorTypeId: 2,
        bedLocationId: 2,
      },
      {
        name: 'Valve 3',
        actuatorTypeId: 2,
        bedLocationId: 3,
      },
      {
        name: 'Valve 4',
        actuatorTypeId: 2,
        bedLocationId: 4,
      },
      {
        name: 'Water Pump',
        actuatorTypeId: 1,
        bedLocationId: null,
      },
      {
        name: 'Nutrient Pump',
        actuatorTypeId: 1,
        bedLocationId: null,
      },
      {
        name: 'Water Valve',
        actuatorTypeId: 2,
        bedLocationId: null,
      },
      {
        name: 'Nutrient Valve',
        actuatorTypeId: 2,
        bedLocationId: null,
      }
    ])
  }
}
