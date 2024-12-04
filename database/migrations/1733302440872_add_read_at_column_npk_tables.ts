import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'npks'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('read_at').nullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
