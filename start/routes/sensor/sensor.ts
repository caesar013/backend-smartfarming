import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.get('/getData', 'SensorReading/SensorReadingController.getData').as('sensor.getData')
  Route.get('/getLatest', 'SensorReading/SensorReadingController.getLatest').as('sensor.getLatest')
  Route.delete('/', 'Sensor/SensorController.destroyAll').as('sensor.destroyAll')
}).prefix('sensor')
Route.resource('/sensors', 'Sensor/SensorController').apiOnly()
