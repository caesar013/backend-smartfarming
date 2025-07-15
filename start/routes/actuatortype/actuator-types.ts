import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'ActuatorType/ActuatorTypeController.destroyAll').as('actuator-types.destroyAll')
}).prefix('actuator-types').middleware('admin')
Route.resource('actuator-types', 'ActuatorType/ActuatorTypeController').apiOnly().middleware({
  'show': ['admin'],
  'store': ['admin'],
  'update': ['admin'],
  'destroy': ['admin'],
})
