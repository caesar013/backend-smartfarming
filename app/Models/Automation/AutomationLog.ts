import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import BatchLocation from 'App/Models/BatchLocation'
import AutomationStatus from './AutomationStatus'

export default class AutomationLog extends BaseModel {
  public static table = 'automation_logs'

  @column({ isPrimary: true })
  public id: number

  // untuk memastikan mapping yang benar antara model (camelCase) dan database (snake_case).
  @column({ serializeAs: 'bathchLocationId' })
  public batchLocationId: number

  @column({ serializeAs: 'automationStatusId' })
  public automationStatusId: number

  @column({
    prepare: (value: object) => JSON.stringify(value), // Convert object to JSON string for storage
    serializeAs: 'payloadInput',
  })
  public payloadInput: object // JSONB type, stored as a string in JS

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

  @belongsTo(() => BatchLocation)
  public batchLocation: BelongsTo<typeof BatchLocation>

  @belongsTo(() => AutomationStatus)
  public automationStatus: BelongsTo<typeof AutomationStatus>
}
