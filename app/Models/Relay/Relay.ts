import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Relay extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public number: number

  @column.dateTime()
  public enabledAt: DateTime

  @column()
  public disabledAt: DateTime

  @column()
  public currentStatus: boolean

  @column.dateTime()
  public created_at: DateTime

  static get table() {
    return "public.relays" // table name
  }
}
