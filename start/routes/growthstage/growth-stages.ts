import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'GrowthStage/GrowthStageController.destroyAll').as('growth-stages.destroyAll')
}).prefix('growth-stages')
Route.resource('growth-stages', 'GrowthStage/GrowthStageController').apiOnly()
