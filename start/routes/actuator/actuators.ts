import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'Actuator/ActuatorController.destroyAll').as('actuators.destroyAll')
  Route.post('/:slug/control', 'Actuator/ActuatorController.control').as('actuators.control')
}).prefix('actuators')
Route.resource('actuators', 'Actuator/ActuatorController').apiOnly()
