import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'batch_locations'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('planting_batch_id').unsigned().notNullable().references('id').inTable('planting_batches').onDelete('CASCADE')
      table.integer('bed_location_id').unsigned().notNullable().references('id').inTable('bed_locations').onDelete('CASCADE')

      table.unique(['planting_batch_id', 'bed_location_id'])

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
