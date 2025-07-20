import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  HasMany,
  hasMany,
} from '@ioc:Adonis/Lucid/Orm'
import BedLocation from '../BedLocation/BedLocation'
// Assuming you have these models for the relationships
// import WeatherData from './WeatherData'
// import WeatherNow from './WeatherNow'

/**
 * Represents a physical location in the database.
 * The table name is 'locations' (plural snake_case of the model name).
 * Lucid ORM handles the mapping automatically.
 */
export default class Location extends BaseModel {
  public static softDelete = true

  /**
   * The primary key for the locations table.
   */
  @column({ isPrimary: true })
  public id: number

  /**
   * The public-facing name of the location.
   * The property 'publicName' (camelCase) maps to the 'public_name' (snake_case) column.
   */
  @column({ serializeAs: 'publicName' })
  public publicName: string

  /**
   * The full street address of the location.
   */
  @column()
  public address: string | null

  /**
   * The geographical latitude of the location.
   */
  @column()
  public latitude: number

  /**
   * The geographical longitude of the location.
   */
  @column()
  public longitude: number

  /**
   * Timestamp for soft deletion.
   * It's nullable and not managed automatically by default for creation/updates.
   */
  @column.dateTime({ serializeAs: 'deletedAt', autoCreate: false, autoUpdate: false })
  public deletedAt: DateTime | null

  /**
   * The timestamp when the record was created.
   * 'autoCreate: true' sets this value automatically on record creation.
   */
  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  /**
   * The timestamp when the record was last updated.
   * 'autoUpdate: true' updates this value automatically on record updates.
   */
  @column.dateTime({ autoCreate: false, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime

  // --- Relationships ---

  /**
   * A location can have many associated bed locations.
   * This defines a one-to-many relationship with the BedLocation model.
   */
  @hasMany(() => BedLocation)
  public bedLocations: HasMany<typeof BedLocation>

  /**
   * Uncomment the following relationships once you have the
   * WeatherData and WeatherNow models created.
   */
  /*
  @hasMany(() => WeatherData)
  public weatherData: HasMany<typeof WeatherData>

  @hasMany(() => WeatherNow)
  public weatherNow: HasMany<typeof WeatherNow>
  */
}
