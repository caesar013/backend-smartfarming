import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'user.account'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      // Mengubah kolom password menjadi nullable
      table.string('password', 200).nullable().alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      // Mengembalikan kolom password menjadi not nullable jika migrasi di-rollback
      table.string('password', 200).notNullable().alter()
    })
  }
}
