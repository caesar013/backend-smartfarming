import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Sensor extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public desc: string

  @column()
  public sensorName: string

  static get table() {
    return "public.sensors" // table name
  }
}
