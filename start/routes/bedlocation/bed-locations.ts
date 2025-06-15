import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'BedLocation/BedLocationController.destroyAll').as('bed-locations.destroyAll')
}).prefix('bed-locations')
Route.resource('bed-locations', 'BedLocation/BedLocationController').apiOnly()
