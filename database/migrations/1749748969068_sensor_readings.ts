import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sensor_readings'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()

      table.integer('sensor_id').unsigned().notNullable().references('id').inTable('sensors').onDelete('CASCADE')

      table.jsonb('payload').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('read_at', { useTz: true }).nullable()
    })

    this.schema.raw(`CREATE INDEX IF NOT EXISTS sensor_readings_created_at_idx ON ${this.tableName} (created_at DESC)`)
    this.schema.raw(`CREATE INDEX IF NOT EXISTS sensor_readings_sensor_id_created_at_idx ON ${this.tableName} (sensor_id, created_at DESC)`)
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
