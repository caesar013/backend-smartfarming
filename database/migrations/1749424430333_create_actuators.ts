import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'actuators'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('actuator_type_id').unsigned().references('id').inTable('actuator_types').onDelete('SET NULL').notNullable()
      table.integer('bed_location_id').unsigned().references('id').inTable('bed_locations').onDelete('SET NULL').nullable()

      table.string('name', 255).notNullable()
      table.string('slug').unique().notNullable()
      // This is the pin number for the relay controlling the actuator
      // This will need refactoring in the future to support multiple relays
      table.integer('relay_pin').notNullable().unsigned().unique()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
