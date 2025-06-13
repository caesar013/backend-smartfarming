import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Account from 'App/Models/User/Account'
import Role from 'App/Models/User/Role'

export default class extends BaseSeeder {
  public async run() {
    const role = await Role.findBy('code', 'ADMN')
    await Account.createMany([
      {
        email: 'admin@admin.com',
        password: 'agrilinkvocpro2024',
        urole_id: role?.id,
        username: 'Admin',
        fullname: 'Administrator',
        google_id: '1'
      },
    ])
  }
}
