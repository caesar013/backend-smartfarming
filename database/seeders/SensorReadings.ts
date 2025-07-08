import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import SensorReading from 'App/Models/SensorReading/SensorReading' // Asumsi Model ada di App/Models/SensorReading.ts
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {

    // PENTING: Pastikan sensor dengan ID 1, 2, dan 3 sudah ada di tabel 'sensors' Anda
    const dhtSensorId = 1
    const npk1SensorId = 2
    const npk2SensorId = 3

    // Definisikan data contoh untuk payload DHT
    const dhtPayload = {
      temperature: 28.5,
      humidity: 75.2,
      luminosity: 800.5,
    }

    // Definisikan data contoh untuk payload NPK
    const npkPayload = {
      temperature: 26,
      humidity: 65,
      conductivity: 120,
      ph: 6.5,
      nitrogen: 15,
      phosphorus: 30,
      potassium: 20,
    }

    await SensorReading.createMany([
      // --- Data Set 1 (Waktu lebih lama) ---
      {
        sensorId: dhtSensorId,
        payload: dhtPayload,
        read_at: DateTime.now().minus({ minutes: 5 }), // Sesuai model: read_at
      },
      {
        sensorId: npk1SensorId,
        payload: npkPayload, // Menggunakan payload NPK yang sama
        read_at: DateTime.now().minus({ minutes: 5 }),
      },
      {
        sensorId: npk2SensorId,
        payload: npkPayload, // Menggunakan payload NPK yang sama
        read_at: DateTime.now().minus({ minutes: 5 }),
      },

      // --- Data Set 2 (Data terbaru) ---
      {
        sensorId: dhtSensorId,
        payload: { ...dhtPayload, humidity: 73.1 }, // Kelembapan sedikit berubah
        read_at: DateTime.now(),
      },
      {
        sensorId: npk1SensorId,
        payload: { ...npkPayload, humidity: 58 }, // Kelembapan tanah NPK1 sedikit berubah
        read_at: DateTime.now(),
      },
      {
        sensorId: npk2SensorId,
        payload: { ...npkPayload, humidity: 59 }, // Kelembapan tanah NPK2 sedikit berubah
        read_at: DateTime.now(),
      },
      // --- DATASET 3 ---
      {
        sensorId: dhtSensorId,
        payload: { ...dhtPayload, humidity: 50.1 }, // Kelembapan sedikit berubah
        read_at: DateTime.now(),
      },
      {
        sensorId: npk1SensorId,
        payload: { ...npkPayload, humidity: 30 }, // Kelembapan tanah NPK1 sedikit berubah
        read_at: DateTime.now(),
      },
      {
        sensorId: npk2SensorId,
        payload: { ...npkPayload, humidity: 20 }, // Kelembapan tanah NPK2 sedikit berubah
        read_at: DateTime.now(),
      },
    ])

    console.log('SensorReadingSeeder executed: Sample sensor readings created.')
  }
}
