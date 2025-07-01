import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sensors'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('sensor_type_id')
        .unsigned()
        .references('id')
        .inTable('sensor_types')
        .onDelete('SET NULL')
        .nullable()
        .after('public_name') // This ensures the new column is added after 'public_name' column
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sensor_type_id')
    })
  }
}
