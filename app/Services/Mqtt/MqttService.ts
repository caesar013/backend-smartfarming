import Env from '@ioc:Adonis/Core/Env'
import SensorReadingService from 'App/Services/SensorReading/SensorReadingService';
import mqtt from "mqtt";

/**
 * Encapsulates the MQTT client and its event handling.
 * This makes it a reusable service throughout the application.
 */
class MqttService {
  public client: mqtt.MqttClient;

  constructor() {
    this.client = mqtt.connect(`mqtt://${Env.get('MQTT_URL')}`, {
      port: Env.get('MQTT_PORT'),
      clientId: `adonisjs_backend_${Math.random().toString(16).slice(2, 8)}`, // More robust client ID
      protocolId: 'MQIsdp',
      protocolVersion: 3,
      connectTimeout: 5000,
      username: Env.get('MQTT_USERNAME'),
      password: Env.get('MQTT_PASSWORD')
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on('connect', () => {
      console.log('✅ MQTT Broker Connected!');

      // Subscribe to the sensor data topic
      this.client.subscribe('farm/sensor/#', { qos: 1 }, (err) => {
        if (!err) {
          console.log("Subscribed successfully to sensor data topic.");
        }
      });

      // You can add other subscriptions here, for example, to get status feedback from actuators
      // this.client.subscribe('farm/actuator/+/status');
    });

    this.client.on('message', async (topic, message) => {
      // Handle incoming sensor data
      if (topic.startsWith('farm/sensor')) {
        console.log(`Received sensor data at ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })}. Processing...`);
        try {
          const msg = JSON.parse(message.toString());
          const service = new SensorReadingService();
          await service.handleIncomingMessage(msg);
        } catch (e) {
            console.error("Failed to process incoming sensor message:", e);
        }
      }

      // Handle other topics like actuator status feedback
      // if (topic.startsWith('farm/actuator/')) { ... }
    });

    this.client.on('reconnect', () => console.log('Reconnecting to MQTT broker...'));
    this.client.on('close', () => console.log('MQTT connection closed'));
    this.client.on('offline', () => console.log('MQTT client is offline'));
    this.client.on('error', (err) => console.error(`Error connecting to MQTT Broker: ${err.message}`));
  }

  // Promisify publish for easier use with async/await
  public publishAsync(topic: string, message: string | Buffer, options?: mqtt.IClientPublishOptions) {
    return new Promise<void>((resolve, reject) => {
      this.client.publish(topic, message, options || {}, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  public get connected(): boolean {
      return this.client.connected;
  }
}

// Export a singleton instance of the service
export default new MqttService();
