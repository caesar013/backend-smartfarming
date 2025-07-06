import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Actuator from 'App/Models/Actuator/Actuator'

export default class extends BaseSeeder {
  public async run() {
    await Actuator.createMany([

      {
        name: 'Valve 1',
        slug: 'valve-1',
        actuatorTypeId: 2,
        bedLocationId: 2,
        relayPin: 97, // will be 14
        maxDuration: 10 // in minutes
      },
      {
        name: 'Valve 2',
        slug: 'valve-2',
        actuatorTypeId: 2,
        bedLocationId: 3,
        relayPin: 98, // will be 27
        maxDuration: 10 // in minutes
      },
      {
        name: 'Valve 3',
        slug: 'valve-3',
        actuatorTypeId: 2,
        bedLocationId: 4,
        relayPin: 99, // will be 26
        maxDuration: 10 // in minutes
      },
      {
        name: 'Pump',
        slug: 'pump',
        actuatorTypeId: 1,
        bedLocationId: null,
        relayPin: 25,
        maxDuration: 10 // in minutes
      },
      {
        name: 'Water Valve',
        slug: 'water-valve',
        actuatorTypeId: 2,
        bedLocationId: null,
        relayPin: 33,
        maxDuration: 10 // in minutes
      },
      {
        name: 'Nutrient Valve',
        slug: 'nutrient-valve',
        actuatorTypeId: 2,
        bedLocationId: null,
        relayPin: 32,
        maxDuration: 10 // in minutes
      }
    ])
  }
}
