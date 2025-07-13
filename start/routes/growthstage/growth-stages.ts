import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'GrowthStage/GrowthStageController.destroyAll').as('growth-stages.destroyAll')
}).prefix('growth-stages').middleware('admin')
Route.resource('growth-stages', 'GrowthStage/GrowthStageController').apiOnly().middleware({
  '*': ['admin'],
})
