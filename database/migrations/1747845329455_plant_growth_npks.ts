import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'plant_growth_npks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('plant_id').unsigned().notNullable()
      table.integer('growth_stage_id').unsigned().notNullable()
      table.foreign('plant_id').references('id').inTable('plants')
      table.foreign('growth_stage_id').references('id').inTable('growth_stages')
      table.integer('min_age').notNullable()
      table.integer('max_age').nullable()
      table.integer('min_n').notNullable()
      table.integer('max_n').nullable()
      table.integer('min_p').notNullable()
      table.integer('max_p').nullable()
      table.integer('min_k').notNullable()
      table.integer('max_k').nullable()

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
