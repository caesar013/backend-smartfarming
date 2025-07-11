import Route from '@ioc:Adonis/Core/Route'

/**
 * Rute untuk fitur Otomatisasi
 * Semua rute di sini memerlukan autentikasi.
 */
Route.group(() => {
  // --- Routes untuk Status On/Off ---
  Route.get('/:system/status', 'Automation/AutomationStatusController.getStatus')
  Route.patch('/:system/status', 'Automation/AutomationStatusController.setStatus')

  // --- Route untuk Riwayat Log ---
  Route.get('/:system/logs', 'Automation/AutomationLogController.index')
})
  .prefix('/automation')
