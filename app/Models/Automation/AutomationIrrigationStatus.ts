import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class AutomationIrrigationStatus extends BaseModel {
  public static table = 'automation_statuses'

  @column({ isPrimary: true })
  public id: number

  @column()
  public isActive: boolean 

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
