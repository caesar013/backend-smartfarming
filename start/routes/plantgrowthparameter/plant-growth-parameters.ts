import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'PlantGrowthParameter/PlantGrowthParameterController.destroyAll').as('plant-growth-parameters.destroyAll')
}).prefix('plant-growth-parameters').middleware('admin')
Route.resource('plant-growth-parameters', 'PlantGrowthParameter/PlantGrowthParameterController').apiOnly().middleware({
  '*': ['admin'],
})
