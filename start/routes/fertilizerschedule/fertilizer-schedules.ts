import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'FertilizerSchedule/FertilizerScheduleController.destroyAll').as('fertilizer-schedules.destroyAll')
}).prefix('fertilizer-schedules').middleware('admin')
Route.resource('fertilizer-schedules', 'FertilizerSchedule/FertilizerScheduleController').apiOnly().middleware({
  '*': ['admin'],
})
