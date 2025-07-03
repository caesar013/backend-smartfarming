import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Sensor from '../Sensor/Sensor'

export default class SensorType extends BaseModel {
  public static softDelete = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string // e.g., "NPK Soil Sensor"

  @column({ serializeAs: 'typeCode' })
  public typeCode: string // e.g., 'NPK', 'DHT', 'PH'

  @column()
  public description: string | null // Description of the sensor type

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime

  @column.dateTime({ serializeAs: 'deletedAt' })
  public deletedAt: DateTime | null

  static get table() {
    return 'public.sensor_types' // table name
  }

  @beforeFind()
  public static findWithoutSoftDeletes(query) {
    query.whereNull('deleted_at')
  }

  @beforeFetch()
  public static fetchWithoutSoftDeletes(query) {
    query.whereNull('deleted_at')
  }

  @hasMany(() => Sensor)
  public sensors: HasMany<typeof Sensor>
}
