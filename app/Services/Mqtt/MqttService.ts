import Env from '@ioc:Adonis/Core/Env'
import SensorReadingService from 'App/Services/SensorReading/SensorReadingService';
import mqtt from "mqtt";
import EventEmitter from 'events';

/**
 * Encapsulates the MQTT client and its event handling.
 * This makes it a reusable service throughout the application.
 */
class MqttService {
  public client: mqtt.MqttClient;
  private emitter: EventEmitter = new EventEmitter();

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

      // Subscribe to a single topic for actuator commands AND replies
      this.client.subscribe('farm/actuator', { qos: 1 }, (err) => {
        if (!err) {
          console.log("Subscribed successfully to actuator topic.")
        }
      })
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
      if (topic === 'farm/actuator') {
        try {
          const data = JSON.parse(message.toString())

          // Check if the message is a status reply and has a correlation ID
          if (data.type === 'status_reply' && data.correlationId) {
            // Emit the event with the correlation ID
            this.emitter.emit(data.correlationId, data)
          }
        } catch (e) {
          console.error("Could not parse incoming actuator JSON:", message.toString())
        }
      }
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

  /**
   * Waits for a specific reply identified by a correlation ID.
   * @param correlationId The unique ID of the command to wait for.
   * @param timeout Duration in milliseconds.
   * @returns A Promise that resolves with the reply payload from the ESP32.
   */
  public waitForResponse(correlationId: string, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;

      const listener = (payload: any) => {
        clearTimeout(timeoutId);
        resolve(payload);
      };

      // Listen for a one-time event named after the correlationId
      this.emitter.once(correlationId, listener);

      // Set a timeout for the response
      timeoutId = setTimeout(() => {
        this.emitter.removeListener(correlationId, listener); // Clean up listener on timeout
        reject(new Error(`Timeout: No response received for correlationId '${correlationId}' within ${timeout}ms.`));
      }, timeout);
    });
  }
}

// Export a singleton instance of the service
export default new MqttService();
