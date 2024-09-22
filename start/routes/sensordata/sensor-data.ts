import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'SensorData/SensorDataController.destroyAll').as('sensor-data.destroyAll')
}).prefix('sensor-data')
Route.resource('sensor-data', 'SensorData/SensorDataController').apiOnly()
