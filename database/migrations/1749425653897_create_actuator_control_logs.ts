import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'actuator_control_logs'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('actuator_id').unsigned().references('id').inTable('actuators').onDelete('CASCADE').notNullable()

      table.string('action', 50).notNullable()
      table.string('triggered_by', 100).defaultTo('System')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
