import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'plant_growth_parameters'

  // public async up() {
  //   // The alterTable method is used to modify an existing table
  //   this.schema.alterTable(this.tableName, (table) => {
  //     // We use .float() for pH because it requires decimal precision (e.g., 5.8)
  //     // .after() places the new column after an existing one for better organization.
  //     table.float('min_ph').notNullable().after('max_soil_humidity')
  //     table.float('max_ph').nullable().after('min_ph')
  //   })
  // }
  
  public async up() {
  this.schema.raw(`
    ALTER TABLE public.plant_growth_parameters
    ADD COLUMN IF NOT EXISTS min_ph REAL;

    ALTER TABLE public.plant_growth_parameters
    ADD COLUMN IF NOT EXISTS max_ph REAL;

    UPDATE public.plant_growth_parameters
    SET min_ph = 5.5
    WHERE min_ph IS NULL;

    UPDATE public.plant_growth_parameters
    SET max_ph = 6.5
    WHERE max_ph IS NULL;

    ALTER TABLE public.plant_growth_parameters
    ALTER COLUMN min_ph SET NOT NULL;
  `)
}


  public async down() {
    // The down method must reverse the up method
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('min_ph')
      table.dropColumn('max_ph')
    })
  }
}
