
// app/Models/Automation/AutomationLog.ts
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import BatchLocation from 'App/Models/BatchLocation'

export default class AutomationIrrigationLog extends BaseModel {
  public static table = 'automation_logs'

  @column({ isPrimary: true })
  public id: number

  // untuk memastikan mapping yang benar antara model (camelCase) dan database (snake_case).
  @column({ columnName: 'npk_temperature_input' })
  public npkTemperatureInput: number | null

  @column({ columnName: 'npk_humidity_input' })
  public npkHumidityInput: number | null

  @column()
  public state: string

  @column()
  public duration: number

  @column.dateTime({
    autoCreate: true, // Sebaiknya autoCreate untuk executedAt jika diisi saat pembuatan log
    serialize: (value: DateTime | null) => {
      return value ? value.setZone('asia/jakarta').toISO() : value
    },
    // PERBAIKAN: Menambahkan nama kolom secara eksplisit
    columnName: 'executed_at',
  })
  public executedAt: DateTime

  // Foreign key
  @column({ columnName: 'batch_location_id' })
  public batchLocationId: number

  @belongsTo(() => BatchLocation)
  public batchLocation: BelongsTo<typeof BatchLocation>
}
