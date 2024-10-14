import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import DataNpk from '../DataNpk/DataNpk'
import DataDht from '../DataDht/DataDht'

export default class Sensor extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public sensor_name: string

  @column()
  public desc: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  static get table() {
    return "public.sensors" // table name
  }

  // has many data npk
  @hasMany(() => DataNpk, {
    foreignKey: 'sensor_id',
  })
  public npk: HasMany<typeof DataNpk>
  // has many data dht
  @hasMany(() => DataDht, {
    foreignKey: 'sensor_id',
  })
  public dht: HasMany<typeof DataDht>
}
