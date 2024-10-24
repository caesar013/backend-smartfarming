import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Sensor from 'App/Models/Sensor/Sensor'
import { DateTime } from 'luxon'

export default class Table extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public table_name: string

  @column.dateTime()
  public created_at: DateTime

  static get table() {
    return "public.tables" // table name
  }

  // has many data npk
  @hasMany(() => Sensor, {
    foreignKey: 'table_id'
  })
  public sensors: HasMany<typeof Sensor>
}
