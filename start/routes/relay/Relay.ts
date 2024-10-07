import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'Relay/RelayController.destroyAll').as('Relay.destroyAll')
}).prefix('Relay')
Route.resource('Relay', 'Relay/RelayController').apiOnly()
Route.post('set-relay', 'Relay/RelayController.setRelay').as('Relay.setRelay');
Route.get('get-relay', 'Relay/RelayController.getRelayStatus').as('Relay.getRelay');
