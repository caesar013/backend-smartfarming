import Env from '@ioc:Adonis/Core/Env'
import SensorReadingService from 'App/Services/SensorReading/SensorReadingService';
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

  client.subscribeAsync('farm/sensor');
  client.on('message', async (_, message) => {

    const msg = JSON.parse(message.toString())
    const service = new SensorReadingService();

    await service.handleIncomingMessage(msg);
  });
});

client.on('reconnect', () => {
  console.log('Reconnecting to MQTT broker...');
});

client.on('close', () => {
  console.log('MQTT connection closed');
});

client.on('offline', () => {
  console.log('MQTT client is offline');
});

client.on('error', (err) => {
  console.log(`Error connecting to MQTT Broker. Message: ${err}`);
});

export default client;
