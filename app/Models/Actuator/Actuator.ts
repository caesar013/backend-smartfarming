import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, BelongsTo, belongsTo, column, HasMany, hasMany, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
import ActuatorType from '../ActuatorType/ActuatorType'
import BedLocation from '../BedLocation/BedLocation'
import ActuatorControlLog from '../ActuatorControlLog/ActuatorControlLog'
import slugify from 'slugify'

export default class Actuator extends BaseModel {
  public static softDelete = true
  public static routeLookupKey = 'slug'

  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'actuatorTypeId' })
  public actuatorTypeId: number

  @column({ serializeAs: 'bedLocationId' })
  public bedLocationId: number | null

  @column()
  public name: string

  @column()
  public slug: string

  @column({ serializeAs: 'maxDuration' })
  public maxDuration: number | null

  @column({ serializeAs: 'relayPin' })
  public relayPin: number

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime | null

  @column.dateTime({ serializeAs: 'deletedAt' })
  public deletedAt: DateTime | null

  static get table() {
    return "public.actuators" // table name
  }

  @beforeCreate()
  public static async createSlug(actuator: Actuator) {
    // Only generate slug if the name is being set/changed
    if (!actuator.$dirty.name) {
      return
    }

    const baseSlug = slugify(actuator.name, {
      lower: true,
      strict: true,
      trim: true,
    })

    let slug = baseSlug
    let counter = 1

    // Keep checking for a unique slug until one is found
    // The loop continues as long as an actuator with the current `slug` exists
    while (await Actuator.query().where('slug', slug).first()) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    actuator.slug = slug
  }

  @beforeFind()
  public static findWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @beforeFetch()
  public static fetchWithoutSoftDeletes(query) {
    query.whereNull("deleted_at")
  }

  @belongsTo(() => ActuatorType)
  public actuatorType: BelongsTo<typeof ActuatorType>

  @belongsTo(() => BedLocation)
  public location: BelongsTo<typeof BedLocation>

  @hasMany(() => ActuatorControlLog)
  public logs: HasMany<typeof ActuatorControlLog>
}
