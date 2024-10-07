import mqtt from "mqtt";

const client = mqtt.connect(`mqtt://127.0.0.1`, {
    port: 1883,
    clientId: 'smartfarming',
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    connectTimeout: 1000,
    username: 'smartfarming',
    password: 'smartfarming'
});

client.on('connect', () => {
    console.log('MQTT BROKER CONNECTED!');

     client.subscribeAsync('smartfarming/sensor/dht');
     client.subscribeAsync('smartfarming/sensor/npk1');
     client.subscribeAsync('smartfarming/sensor/npk2');

    client.on('message', (topic, message) => {
        switch (topic) {
            case ('smartfarming/sensor/dht'):
                console.log('ini dht');
                break;
            case('smartfarming/sensor/npk1'):
                console.log('ini npk1');
                break;
            case('smartfarming/sensor/npk2'):
                console.log('ini npk2');
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