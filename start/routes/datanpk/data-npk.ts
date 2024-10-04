import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'DataNpk/DataNpkController.destroyAll').as('data-npk.destroyAll')
}).prefix('data-npk')
Route.resource('data-npk', 'DataNpk/DataNpkController').apiOnly()
