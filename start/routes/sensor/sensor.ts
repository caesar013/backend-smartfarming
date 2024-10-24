import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.get('/getData', 'Sensor/SensorController.getData').as('sensor.getData')
  Route.get('/getLatest', 'Sensor/SensorController.getLatest').as('sensor.getLatest')
}).prefix('sensor')
