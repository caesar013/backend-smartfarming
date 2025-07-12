import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.put('/:username', 'Profile/ProfileController.update').as('profiles.update')
  Route.get('/:username', 'Profile/ProfileController.show').as('profiles.show')
}).prefix('profiles')
