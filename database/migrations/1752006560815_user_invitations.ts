import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'invitations'

  public async up () {
    this.schema.withSchema('user').createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('user_id').references('id').inTable('user.account').onDelete('CASCADE')
      table.string('token', 255).notNullable().unique()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down () {
    this.schema.withSchema('user').dropTable(this.tableName)
  }
}
