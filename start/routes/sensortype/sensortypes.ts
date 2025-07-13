import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'SensorType/SensorTypeController.destroyAll').as('sensor-type.destroyAll')
}).prefix('sensor-type').middleware('admin')
Route.resource('/sensor-types', 'SensorType/SensorTypeController').apiOnly().middleware({
  '*': ['admin'],
})
