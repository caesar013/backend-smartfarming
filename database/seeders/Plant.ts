import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Plant from 'App/Models/Plant/Plant'

export default class extends BaseSeeder {
  public async run () {
    const plants = [
      {
        name: 'Stroberi',
        scientificName: 'Fragaria × ananassa',
        description: 'Stroberi adalah buah yang manis dan segar, sering digunakan dalam makanan penutup.'
      },
      {
        name: 'Kabocha',
        scientificName: 'Cucurbita maxima',
        description: 'Kabocha adalah jenis labu yang memiliki daging manis dan tekstur lembut, sering digunakan dalam sup atau hidangan panggang.'
      },
      {
        name: 'Kale',
        scientificName: 'Brassica oleracea var. sabellica',
        description: 'Kale adalah sayuran daun dari keluarga kubis yang memiliki daun hijau keriting, kaya vitamin, mineral, dan antioksidan.'
      }
    ]

    for (const plant of plants) {
      await Plant.updateOrCreate(
        { name: plant.name },
        plant
      )
    }
  }
}
