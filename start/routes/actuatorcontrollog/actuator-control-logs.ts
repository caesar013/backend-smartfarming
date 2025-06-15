import Route from '@ioc:Adonis/Core/Route'

Route.resource('actuator-control-logs', 'ActuatorControlLog/ActuatorControlLogController').apiOnly().except(['update', 'destroy'])
