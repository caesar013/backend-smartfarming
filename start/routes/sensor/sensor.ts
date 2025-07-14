import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.get('/getData', 'Sensor/SensorController.getData').as('sensor.getData')
  Route.get('/getLatest', 'Sensor/SensorController.getLatest').as('sensor.getLatest')
  Route.delete('/', 'Sensor/SensorController.destroyAll').as('sensor.destroyAll')
}).prefix('sensor').middleware('admin')
Route.resource('/sensors', 'Sensor/SensorController').apiOnly().middleware({
  'store': ['admin'],
  'show': ['admin'],
  'update': ['admin'],
  'destroy': ['admin'],
})
