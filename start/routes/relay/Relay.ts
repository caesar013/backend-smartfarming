import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.post('set-relay', 'Relay/RelayController.setRelay').as('Relay.setRelay');
  Route.get('get-relay', 'Relay/RelayController.getRelayStatus').as('Relay.getRelay');
}).prefix('relay')
