import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import SensorType from 'App/Models/SensorType/SensorType'

export default class extends BaseSeeder {
  public async run() {
    // Import the SensorType model
    await SensorType.createMany([
      {
        name: 'NPK Soil Sensor',
        typeCode: 'NPK',
        description: 'Measures temperature, humidity, pH, electro conductivity, nitrogen, phosphorus, and potassium levels in soil.'
      },
      {
        name: 'DHT Temperature and Humidity Sensor',
        typeCode: 'DHT',
        description: 'Measures temperature and humidity levels.'
      },
    ])
    }
}
