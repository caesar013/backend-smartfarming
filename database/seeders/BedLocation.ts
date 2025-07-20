import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import BedLocation from 'App/Models/BedLocation/BedLocation'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    await BedLocation.createMany([
      {
        name: 'Raise Bed 1',
        description: 'Located at the west most side of the greenhouse',
        locationId: 1,
      },
      {
        name: 'Raise Bed 2',
        description: 'Located at the center of the greenhouse',
        locationId: 1,
      },
      {
        name: 'Raise Bed 3',
        description: 'Located at the east most side of the greenhouse',
        locationId: 1,
      },
      {
        name: 'Raise Bed 4',
        description: 'Located at the north most side of the greenhouse',
        locationId: 1,
      },
    ])
  }
}
