import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Dht from 'App/Models/Sensor/Dht'
import Npk from 'App/Models/Sensor/Npk'
import Table from 'App/Models/Sensor/Table'

export default class Sensor extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public sensor_name: string

  @column()
  public desc: string

  @column()
    public table_id: number

  static get table() {
    return "public.sensors" // table name
  }

  // has many data npk
  @hasMany(() => Npk, {
    foreignKey: 'sensor_id',
  })
  public npk: HasMany<typeof Npk>
  // has many data dht
  @hasMany(() => Dht, {
    foreignKey: 'sensor_id',
  })
  public dht: HasMany<typeof Dht>

  @belongsTo(() => Table, {
    foreignKey: 'table_id',
  })
  public table: BelongsTo<typeof Table>
}
