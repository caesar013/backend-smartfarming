import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'plant_growth_parameters'

  public async up() {
    // The alterTable method is used to modify an existing table
    this.schema.alterTable(this.tableName, (table) => {
      // We use .float() for pH because it requires decimal precision (e.g., 5.8)
      // .after() places the new column after an existing one for better organization.
      table.float('min_ph').notNullable().after('max_soil_humidity')
      table.float('max_ph').nullable().after('min_ph')
    })
  }

  public async down() {
    // The down method must reverse the up method
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('min_ph')
      table.dropColumn('max_ph')
    })
  }
}
