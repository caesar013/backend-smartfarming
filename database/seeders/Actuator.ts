import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Actuator from 'App/Models/Actuator/Actuator'

export default class extends BaseSeeder {
  public async run() {
    await Actuator.createMany([

      {
        name: 'Valve 1',
        slug: 'valve-1',
        actuatorTypeId: 2,
        bedLocationId: 1,
        relayPin: 96,
      },
      {
        name: 'Valve 2',
        slug: 'valve-2',
        actuatorTypeId: 2,
        bedLocationId: 2,
        relayPin: 97,
      },
      {
        name: 'Valve 3',
        slug: 'valve-3',
        actuatorTypeId: 2,
        bedLocationId: 3,
        relayPin: 98,
      },
      {
        name: 'Valve 4',
        slug: 'valve-4',
        actuatorTypeId: 2,
        bedLocationId: 4,
        relayPin: 99,
      },
      {
        name: 'Water Pump',
        slug: 'water-pump',
        actuatorTypeId: 1,
        bedLocationId: null,
        relayPin: 26,
      },
      {
        name: 'Nutrient Pump',
        slug: 'nutrient-pump',
        actuatorTypeId: 1,
        bedLocationId: null,
        relayPin: 25,
      },
      {
        name: 'Water Valve',
        slug: 'water-valve',
        actuatorTypeId: 2,
        bedLocationId: null,
        relayPin: 33,
      },
      {
        name: 'Nutrient Valve',
        slug: 'nutrient-valve',
        actuatorTypeId: 2,
        bedLocationId: null,
        relayPin: 32,
      }
    ])
  }
}
