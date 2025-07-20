import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'Location/LocationController.destroyAll').as('locations.destroyAll')
}).prefix('locations').middleware('admin')
Route.resource('locations', 'Location/LocationController').apiOnly().middleware({
  'store': ['admin'],
  'show': ['admin'],
  'update': ['admin'],
  'destroy': ['admin'],
})
