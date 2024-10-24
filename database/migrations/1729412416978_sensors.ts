import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sensors'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.text('desc').nullable()
      table.string('sensor_name', 12)
      table.bigint('table_id').unsigned().references('id').inTable('tables')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
