import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'fertilizer_schedules'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('plant_growth_parameter_id').unsigned().references('id').inTable('plant_growth_parameters')
      table.integer('fertilizer_id').unsigned().references('id').inTable('fertilizers')
      table.integer('day_of_application').unsigned().notNullable() // Day of application in the growth cycle, e.g., 30

      table.decimal('amount', 8, 2).notNullable() // The amount, e.g., 0.27
      table.string('unit', 50).defaultTo('g/plant') // The unit, e.g., g/plant, kg/ha

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
