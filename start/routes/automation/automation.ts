import Route from '@ioc:Adonis/Core/Route'

/**
 * Rute untuk fitur Otomatisasi
 * Semua rute di sini memerlukan autentikasi.
 */
Route.group(() => {
  // --- Routes untuk Status On/Off ---
  Route.get('/status', 'Automation/AutomationIrrigationStatusesController.getStatus')
  Route.post('/status', 'Automation/AutomationIrrigationStatusesController.setStatus')

  // --- Route untuk Riwayat Log ---
  Route.get('/logs', 'Automation/AutomationIrrigationLogsController.index')
})
  .prefix('/automation')
  .middleware('auth')
