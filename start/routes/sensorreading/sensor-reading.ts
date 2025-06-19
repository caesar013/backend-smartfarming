import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'SensorReading/SensorReadingController.destroyAll').as('sensor-reading.destroyAll')
  Route.get('/latest', 'SensorReading/SensorReadingController.getLatest').as('sensor-reading.getLatest')
  Route.get('/search', 'SensorReading/SensorReadingController.search').as('sensor-reading.search').middleware(['normalizeQueryFilter'])
}).prefix('sensor-readings')
Route.resource('sensor-readings', 'SensorReading/SensorReadingController').apiOnly()
