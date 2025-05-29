import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Plant from 'App/Models/Plant/Plant'

export default class extends BaseSeeder {
  public async run () {
    await Plant.createMany([
      {
        name: 'Stroberi',
        scientificName: 'Fragaria × ananassa',
        description: 'Stroberi adalah buah yang manis dan segar, sering digunakan dalam makanan penutup.'
      },
      {
        name: 'Kabocha',
        scientificName: 'Cucurbita maxima',
        description: 'Kabocha adalah jenis labu yang memiliki daging manis dan tekstur lembut, sering digunakan dalam sup atau hidangan panggang.'
      }
    ])
  }
}
