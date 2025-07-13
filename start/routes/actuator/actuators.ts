import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'Actuator/ActuatorController.destroyAll').as('actuators.destroyAll')
  Route.post('/:slug/control', 'Actuator/ActuatorController.control').as('actuators.control')
  Route.get('/status', 'Actuator/ActuatorController.getStatus').as('actuators.getStatus')
}).prefix('actuators').middleware('admin')
Route.resource('actuators', 'Actuator/ActuatorController').apiOnly().middleware({
  'show': ['admin'],
  'store': ['admin'],
  'update': ['admin'],
  'destroy': ['admin'],
})
