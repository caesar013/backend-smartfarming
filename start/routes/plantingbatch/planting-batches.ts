import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'PlantingBatch/PlantingBatchController.destroyAll').as('planting-batches.destroyAll')
}).prefix('planting-batches')
Route.resource('planting-batches', 'PlantingBatch/PlantingBatchController').apiOnly()
