import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'locations'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('public_name', 100).notNullable()
      // address: text, nullable
      // .text() creates a TEXT column, which is nullable by default.
      table.text('address').nullable()

      // latitude: numeric(9,6), not null
      // .decimal(precision, scale) maps to the NUMERIC type.
      table.decimal('latitude', 9, 6).notNullable()

      // longitude: numeric(9,6), not null
      table.decimal('longitude', 9, 6).notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
