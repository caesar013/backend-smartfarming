import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/User/Role'

export default class extends BaseSeeder {
  public async run () {
    await Role.createMany([
      {
        code: 'ADMN',
        name: 'Admin'
      }, 
      {
        code: 'USER',
        name: 'User'
      }
    ])
  }
}
