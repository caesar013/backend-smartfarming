import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sensors'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.bigint('bed_location_id').unsigned().references('id').inTable('bed_locations').onDelete('SET NULL').nullable().after('table_id');
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('bed_location_id');
    })
  }
}
