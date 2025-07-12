import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.resource('users', 'Admin/UsersController').apiOnly()
  Route.patch('users/:id/ban', 'Admin/UsersController.ban').as('users.ban')
}).prefix('admin').middleware('admin').as('admin')
