/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'
import fs from 'fs';
import 'App/Services/Mqtt/MqttService' // Ensure MQTT service is initialized
import BatchLocation from 'App/Models/BatchLocation';
import SensorReadingService from 'App/Services/SensorReading/SensorReadingService';

Route.group(function () {
  if (fs.existsSync(`${__dirname}/routes`)) {
    const folders = fs.readdirSync(`${__dirname}/routes`)
    folders.map((folder) => {
      if (folder != 'auth') {
        const files = fs.readdirSync(`${__dirname}/routes/${folder}`)
        files.map((file) => {
          if (!file.includes('.map')) {
            require(`${__dirname}/routes/${folder}/${file}`)
          }
        })
      }
    })
  }
}).prefix('api').middleware('auth')

Route.group(function () {
  if (fs.existsSync(`${__dirname}/routes/auth`)) {
    const files = fs.readdirSync(`${__dirname}/routes/auth`)
    files.map((file) => {
      if (!file.includes('.map')) {
        require(`${__dirname}/routes/auth/${file}`)
      }
    })
  }
}).prefix('auth')

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})

Route.get('/api', async () => {
  const allBatchLocations = await BatchLocation.query()
    .whereHas('plantingBatch', (batchQuery) => {
      batchQuery.whereNull('harvest_date')
        .whereHas('plant', ($eqiLoveNisa) => {
          $eqiLoveNisa.where('name', 'Stroberi')
        })
    })
    .whereHas('bedLocation', ($nisaLoveEqi) => {
      $nisaLoveEqi.where('id', 2) // this will only get group bed 2 as intended in the thesis
    })
    .preload('bedLocation', (bedQuery) => {
      bedQuery
        .preload('sensors', (sensorQuery) => {
          sensorQuery.whereHas('sensorType', (typeQuery) => {
            typeQuery.where('type_code', 'NPK')
          }).preload('sensorType')
        })
    })
  const sensors = allBatchLocations[0].bedLocation.sensors

  // 3. Find the sensor with the CORRECT comparison operator
  const npkSensor = sensors.find(sensor => sensor.sensorType.typeCode === 'NPK')

  // 4. Check if the NPK sensor was actually found
  if (!npkSensor) {
    console.log('NPK sensor not found for this location.')
    return [] // Return empty array
  }
  const sss = new SensorReadingService()
  const actualReadings = await sss.getLatestReadings(npkSensor.id)
  return actualReadings
})

Route.on('*').render('index')
