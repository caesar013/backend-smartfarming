import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import BedLocation from 'App/Models/BedLocation/BedLocation'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await BedLocation.createMany([
      {
        location: 'Raise Bed 1',
        description: 'Located at the west most side of the greenhouse',
        address: 'Nganti, Batu, East Java, Indonesia',
      },
      {
        location: 'Raise Bed 2',
        description: 'Located at the center of the greenhouse',
        address: 'Nganti, Batu, East Java, Indonesia',
      },
      {
        location: 'Raise Bed 3',
        description: 'Located at the east most side of the greenhouse',
        address: 'Nganti, Batu, East Java, Indonesia',
      },
      {
        location: 'Raise Bed 4',
        description: 'Located at the north most side of the greenhouse',
        address: 'Nganti, Batu, East Java, Indonesia',
      },
    ])
  }
}
