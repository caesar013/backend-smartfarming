import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'Plant/PlantController.destroyAll').as('plants.destroyAll')
}).prefix('plants')
Route.resource('plants', 'Plant/PlantController').apiOnly()
