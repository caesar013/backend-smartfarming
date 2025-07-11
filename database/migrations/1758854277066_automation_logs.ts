// database/migrations/YOUR_TIMESTAMP_automation_logs.ts

import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'automation_logs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      // Foreign key dari table batch_location
      table.integer('batch_location_id').unsigned().references('id').inTable('batch_locations').onDelete('SET NULL')
      table.integer('automation_status_id').unsigned().references('id').inTable('automation_statuses').onDelete('SET NULL')
      // untuk menerima nilai desimal dari sensor.
      table.jsonb('payload_input').notNullable()
      table.string('state').notNullable() // Keputusan dari model ML
      table.integer('duration').unsigned().notNullable().defaultTo(0) // Durasi dalam detik
      // Timestamp
      table.timestamp('executed_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
