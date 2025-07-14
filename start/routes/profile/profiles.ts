import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.patch('/', 'Profile/ProfileController.update').as('profiles.update')
  Route.get('/', 'Profile/ProfileController.show').as('profiles.show')

  Route.post('/change-password', 'Profile/ProfileController.changePassword').as('profiles.changePassword')
}).prefix('profiles')
