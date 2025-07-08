import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'actuator_control_logs'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      // this column will store the time when the actuator is supposed to turn off
      table.dateTime('turn_off_at').nullable().after('created_at')
      // this index is used to speed up queries
      table.index(['actuator_id', 'action', 'created_at'], 'actuator_action_created_at_index')
      // this index is for the cron job's main query
      table.index(['turn_off_at'], 'turn_off_at_index')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('turn_off_at')
      table.dropIndex(['actuator_id', 'action', 'created_at'], 'actuator_action_created_at_index')
      table.dropIndex(['turn_off_at'], 'turn_off_at_index')
    })
  }
}
