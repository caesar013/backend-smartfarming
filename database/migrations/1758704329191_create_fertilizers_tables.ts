import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'fertilizers'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable().unique()

      // columns for nutrient percentages
      table.decimal('n_percentage', 5, 2).nullable() // Nitrogen percentage (%)
      table.decimal('p_percentage', 5, 2).nullable() // Phosphorus percentage (%)
      table.decimal('k_percentage', 5, 2).nullable() // Potassium percentage (%)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('deleted_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
