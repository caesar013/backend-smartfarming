import { schema } from '@ioc:Adonis/Core/Validator'

// Ekspor objek skema secara langsung
export const SearchQuerySchema = schema.create({
  sensor: schema.array.optional().members(schema.string()),
  metric: schema.array.optional().members(schema.string()),
  range: schema.object.optional().members({
    start: schema.date.optional({ format: 'yyyy-MM-dd' }),
    end: schema.date.optional({ format: 'yyyy-MM-dd' }),
    time_range: schema.enum.optional(['HOURLY', 'DAILY'] as const),
  }),
})
