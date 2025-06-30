import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.get('/latest', 'SensorReading/SensorReadingController.getLatest').as('sensor-reading.getLatest')
  Route.get('/search', 'SensorReading/SensorReadingController.search').as('sensor-reading.search').middleware(['normalizeQueryFilter'])
}).prefix('sensor-readings')

Route.get('/run-automation', 'Automation/AutomationsController.run').as('automation.run')
