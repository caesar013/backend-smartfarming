import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'Actuator/ActuatorController.destroyAll').as('actuators.destroyAll')
}).prefix('actuators')
Route.resource('actuators', 'Actuator/ActuatorController').apiOnly()
