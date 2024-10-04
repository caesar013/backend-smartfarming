import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'DataDht/DataDhtController.destroyAll').as('data-dht.destroyAll')
}).prefix('data-dht')
Route.resource('data-dht', 'DataDht/DataDhtController').apiOnly()
