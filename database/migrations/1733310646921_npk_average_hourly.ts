import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'npk_average_hourlies'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('temperature')
      table.integer('humidity')
      table.integer('conductivity')
      table.integer('ph')
      table.integer('nitrogen')
      table.integer('phosphorus')
      table.integer('potassium')
      table.integer('sensor_id').unsigned().references('id').inTable('sensors')
      table.timestamp('created_at').defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
