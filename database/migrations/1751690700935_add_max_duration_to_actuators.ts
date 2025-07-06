import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'actuators'

  public async up () {
    // add index to the 'actuators' table
    this.schema.table(this.tableName, (table) => {
      // this column is used to store maximum duration in minutes
      table.integer('max_duration').nullable().defaultTo(15).after('slug')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      // drop the 'max_duration' column
      table.dropColumn('max_duration')
    })
  }
}
