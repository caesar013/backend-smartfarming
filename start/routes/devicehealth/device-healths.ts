import Route from '@ioc:Adonis/Core/Route'

Route.group(function () {
  Route.post('/', 'DeviceHealth/DeviceHealthController.checkDeviceStatus')
}).prefix('device-healths').middleware('admin')
