import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'dhts'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('temperature', 3).alter()
      table.float('humidity', 3).alter()
      table.float('luminosity', 3).alter()
      table.dateTime('read_at', { useTz: false }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
