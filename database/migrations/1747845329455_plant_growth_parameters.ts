import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'plant_growth_parameters'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('plant_id').unsigned().notNullable().references('id').inTable('plants').onDelete('CASCADE')
      table.integer('growth_stage_id').unsigned().notNullable().references('id').inTable('growth_stages').onDelete('CASCADE')
      table.smallint('min_age').notNullable()
      table.smallint('max_age').nullable()
      table.smallint('min_n').notNullable()
      table.smallint('max_n').nullable()
      table.smallint('min_p').notNullable()
      table.smallint('max_p').nullable()
      table.smallint('min_k').notNullable()
      table.smallint('max_k').nullable()

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
