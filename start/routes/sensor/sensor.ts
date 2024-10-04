import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'Sensor/SensorController.destroyAll').as('sensor.destroyAll')
  Route.get('/getData', 'Sensor/SensorController.getData').as('sensor.getData')
}).prefix('sensor')
Route.resource('sensor', 'Sensor/SensorController').apiOnly()
