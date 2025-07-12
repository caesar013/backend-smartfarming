// app/Models/Invitation.ts
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Account from '../User/Account'

export default class Invitation extends BaseModel {
  public static table = 'user.invitations'

  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'userId' })
  public userId: string

  @column()
  public token: string

  @column.dateTime({ serializeAs: 'expiresAt' })
  public expiresAt: DateTime

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime | null

  @belongsTo(() => Account, {
    foreignKey: 'userId',
    localKey: 'id',
  })
  public user: BelongsTo<typeof Account>
}
