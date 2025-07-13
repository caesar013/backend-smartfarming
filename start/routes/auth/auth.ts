import Route from '@ioc:Adonis/Core/Route'

Route.post('/login', 'Auth/AuthController.login').as('auth.login')
Route.post('/logout', 'Auth/AuthController.logout').as('auth.logout')
Route.post('/register', 'Auth/AuthController.register').as('auth.register')
Route.get('/google/redirect', 'Auth/AuthController.oauthRedirect').as('auth.redirect')
Route.get('/google/callback', 'Auth/AuthController.oauthCallback').as('auth.callback')
Route.post('/forgot-password', 'Auth/AuthController.forgotPassword').as('auth.forgot-password')
Route.post('/reset-password', 'Auth/AuthController.restorePassword').as('auth.reset-password')
Route.get('/me', 'Auth/AuthController.me').as('auth.me').middleware('auth')
