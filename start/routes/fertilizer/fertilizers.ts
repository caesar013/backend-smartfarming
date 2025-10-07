import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'Fertilizer/FertilizerController.destroyAll').as('fertilizers.destroyAll')
}).prefix('fertilizers').middleware('admin')
Route.resource('fertilizers', 'Fertilizer/FertilizerController').apiOnly().middleware({
  '*': ['admin'],
})
