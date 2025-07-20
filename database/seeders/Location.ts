import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Location from 'App/Models/Location/Location'

export default class extends BaseSeeder {
  public async run() {
    // Using createMany is efficient for seeding multiple records at once.
    // Note: We don't need to specify 'id', 'created_at', or 'updated_at'
    // as the database and Lucid ORM handle them automatically.
    await Location.createMany([
      {
        publicName: 'BumiAji',
        address: 'Nganti, Batu, East Java, Indonesia',
        latitude: -7.849405,
        longitude: 112.536134,
      },
      {
        publicName: 'BumiMalang',
        address: 'Malang, East Java, Indonesia',
        latitude: -7.946732,
        longitude: 112.616121,
      },
    ])
  }
}

