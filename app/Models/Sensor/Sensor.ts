import { BaseModel, beforeFetch, beforeFind, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import BedLocation from '../BedLocation/BedLocation'
import SensorReading from '../SensorReading/SensorReading'

export default class Sensor extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'bedLocationId' })
  public bedLocationId: number | null

  @column()
  public name: string

  @column({ serializeAs: 'publicName' })
  public publicName: string

  @column()
  public desc: string | null

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime | null

  @column.dateTime({ serializeAs: 'deletedAt' })
  public deletedAt: DateTime | null

  static get table() {
    return "public.sensors" // table name
  }

  @beforeFind()
  public static findWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @beforeFetch()
  public static fetchWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @belongsTo(() => BedLocation)
  public location: BelongsTo<typeof BedLocation>

  @hasMany(() => SensorReading)
  public readings: HasMany<typeof SensorReading>
}
