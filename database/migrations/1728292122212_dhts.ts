import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'dhts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('temperature')
      table.integer('humidity')
      table.integer('luminosity')
      table.bigInteger('sensor_id').unsigned();
      table.foreign('sensor_id').references('id').inTable('sensors');
      table.timestamp('created_at').defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
