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

  client.subscribeAsync('farm/sensor');
  client.on('message', async (_, message) => {
    console.log('Message:', message.toString());
	// console.log(JSON.parse(message.toString()));
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
