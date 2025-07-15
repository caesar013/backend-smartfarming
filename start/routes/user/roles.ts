import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.delete('/', 'User/RoleController.destroyAll').as('roles.destroyAll')
}).prefix('roles').middleware('admin')
Route.resource('roles', 'User/RoleController').apiOnly().middleware({
  'show': ['admin'],
  'store': ['admin'],
  'update': ['admin'],
  'destroy': ['admin'],
})
