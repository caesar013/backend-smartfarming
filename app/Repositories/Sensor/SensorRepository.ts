import Dht from "App/Models/Sensor/Dht";
import Npk from "App/Models/Sensor/Npk";
import Sensor from "App/Models/Sensor/Sensor";

export default class SensorRepository {
    public static async storeNpk(data: any, type: string){
        const sensor = await Sensor.findByOrFail('sensor_name', type);

        try {
            await Npk.create({
                temperature: data.temperature,
                humidity: data.humidity,
                conductivity: data.conductivity,
                ph: data.ph,
                nitrogen: data.nitrogen,
                phosphorus: data.phosphorus,
                pottasium: data.pottasium,
                sensor_id: sensor.id
            });
        } catch (e) {
            console.log('Error insertting npk data. Message: ', e.message);
        }
        
    }

    public static async storeDht(data: any){
        const sensor = await Sensor.findByOrFail('sensor_name', 'dht');

        try {
            await Dht.create({
                temperature: data.temperature,
                humidity: data.humidity,
                luminosity: data.luminosity,
                sensor_id: sensor.id
            });
        } catch (e) {
            console.log('Error insertting dht data. Message: ', e.message);
        }
        
    }
}