import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'bed_locations'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('address') // Drop the existing address column

      table.integer('location_id').unsigned().references('id').inTable('locations')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('address').nullable()

      table.dropForeign(['location_id']) // Drop the foreign key constraint
      table.dropColumn('location_id') // Drop the foreign key column if it exists
    })
  }
}
