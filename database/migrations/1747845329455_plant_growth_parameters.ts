import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'plant_growth_parameters'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('plant_id').unsigned().notNullable().references('id').inTable('plants').onDelete('CASCADE')
      table.integer('growth_stage_id').unsigned().notNullable().references('id').inTable('growth_stages').onDelete('CASCADE')
      table.smallint('min_age').notNullable() // Minimum age in days
      table.smallint('max_age').nullable() // Maximum age in days
      table.smallint('min_soil_ec').notNullable() // Minimum electrical conductivity in μS/cm
      table.smallint('max_soil_ec').nullable() // Maximum electrical conductivity in μS/cm
      table.smallint('min_soil_humidity').notNullable() // Minimum humidity content in %
      table.smallint('max_soil_humidity').nullable() // Maximum humidity content in %
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()

      table.unique(['plant_id', 'growth_stage_id'])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
