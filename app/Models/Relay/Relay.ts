import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Relay extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public number: number

  @column()
  public enabledAt: DateTime

  @column()
  public disabledAt: DateTime

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  static get table() {
    return "" // table name
  }
}
