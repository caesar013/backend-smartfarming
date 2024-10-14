import SensorRepository from "../app/Repositories/Sensor/SensorRepository";
import Env from '@ioc:Adonis/Core/Env'
import mqtt from "mqtt";

const client = mqtt.connect(`mqtt://${Env.get('MQTT_URL')}`, {
    port: Env.get('MQTT_PORT'),
    clientId: Env.get('MQTT_CLIENT_ID'),
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    connectTimeout: 1000,
    username: Env.get('MQTT_USERNAME'),
    password: Env.get('MQTT_PASSWORD')
});

client.on('connect', () => {
    console.log('MQTT BROKER CONNECTED!');

     client.subscribeAsync('smartfarming/sensor/dht');
     client.subscribeAsync('smartfarming/sensor/npk1');
     client.subscribeAsync('smartfarming/sensor/npk2');

    client.on('message', async (topic, message) => {
        switch (topic) {
            case ('smartfarming/sensor/dht'):
                await SensorRepository.storeDht(JSON.parse(message.toString()));
                break;
            case('smartfarming/sensor/npk1'):
                await SensorRepository.storeNpk(JSON.parse(message.toString()), 'npk-1');
                break;
            case('smartfarming/sensor/npk2'):
                await SensorRepository.storeNpk(JSON.parse(message.toString()), 'npk-2');
                break;
            default:
                break;
        }
    });
});

client.on('error', (err) => {
    console.log(`Error connecting to MQTT Broker. Message: ${err}`);
});

export default client;