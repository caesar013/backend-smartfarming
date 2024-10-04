import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'Sensor/SensorController.destroyAll').as('sensor.destroyAll')
}).prefix('sensor')
Route.resource('sensor', 'Sensor/SensorController').apiOnly()
