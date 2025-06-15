import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'SensorReading/SensorReadingController.destroyAll').as('sensor-reading.destroyAll')
  Route.get('/latest', 'SensorReading/SensorReadingController.getLatest').as('sensor-reading.getLatest')
  Route.get('/search', 'SensorReading/SensorReadingController.search').as('sensor-reading.search')
}).prefix('sensor-reading')
Route.resource('sensor-reading', 'SensorReading/SensorReadingController').apiOnly()
