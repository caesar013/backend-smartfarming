import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class AutomationStatus extends BaseModel {
  public static table = 'automation_statuses'
  public static routeLookupKey = 'system'

  @column({ isPrimary: true })
  public id: number

  @column()
  public system: string

  @column({ serializeAs: 'isActive' })
  public isActive: boolean

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime
}
