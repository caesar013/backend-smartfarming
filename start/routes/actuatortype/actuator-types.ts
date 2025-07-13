import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'ActuatorType/ActuatorTypeController.destroyAll').as('actuator-types.destroyAll')
}).prefix('actuator-types').middleware('admin')
Route.resource('actuator-types', 'ActuatorType/ActuatorTypeController').apiOnly()
