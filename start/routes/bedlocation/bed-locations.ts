import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'BedLocation/BedLocationController.destroyAll').as('bed-locations.destroyAll')
}).prefix('bed-locations').middleware('admin')
Route.resource('bed-locations', 'BedLocation/BedLocationController').apiOnly().middleware({
  '*': ['admin'],
})
