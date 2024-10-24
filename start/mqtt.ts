import { TOPICS } from "App/Enums/TOPICS";
import Env from '@ioc:Adonis/Core/Env'
import SensorService from "App/Services/Sensor/SensorService";
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

  Object.values(TOPICS).forEach(topic => {
    client.subscribeAsync(topic)
  })

  client.on('message', async (topic, message) => {
    await SensorService.handleMessage(topic, message)
  })
});

client.on('error', (err) => {
  console.log(`Error connecting to MQTT Broker. Message: ${err}`);
});

export default client;
