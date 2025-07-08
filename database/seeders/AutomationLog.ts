// database/seeders/AutomationLogSeeder.ts

import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import AutomationIrrigationLog from 'App/Models/Automation/AutomationIrrigationLog'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    // Hapus data lama agar tidak duplikat setiap kali seeder dijalankan
    await AutomationIrrigationLog.truncate()

    // Data untuk 3 hari yang berbeda
    const logsData = [
      // Log untuk HARI INI
      {
        batchLocationId: 1, // Pastikan ID ini ada di tabel batch_locations
        dhtTemperatureInput: 28.5,
        npkHumidityInput: 45.2,
        state: 'Menyiram',
        duration: 240,
        executedAt: DateTime.now(),
      },
      // Log untuk KEMARIN
      {
        batchLocationId: 1,
        dhtTemperatureInput: 27.1,
        npkHumidityInput: 65.8,
        state: 'Tidak Menyiram',
        duration: 0,
        executedAt: DateTime.now().minus({ days: 1 }),
      },
      // Log untuk 2 HARI YANG LALU
      {
        batchLocationId: 1,
        dhtTemperatureInput: 29.8,
        npkHumidityInput: 41.0,
        state: 'Menyiram',
        duration: 280,
        executedAt: DateTime.now().minus({ days: 2 }),
      },
    ]

    try {
      // Masukkan data ke database
      await AutomationIrrigationLog.createMany(logsData)
      console.log('Database seeded with 3 manual automation logs.')
    } catch (error) {
      console.error('Error seeding automation logs:', error.message)
    }
  }
}