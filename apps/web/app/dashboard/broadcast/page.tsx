/**
 * @file        page.tsx
 * @module      @medico/web/dashboard/broadcast
 * @description Invio broadcast ai pazienti prenotati in un giorno
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/interfaccia/ux-flows#View-3]]
 * @see         [[docs/areas/notifiche/sistema-notifiche#Broadcast]]
 */

export default function BroadcastPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Broadcast Pazienti</h1>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giorno target
          </label>
          <input
            type="date"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
          <p className="mt-1 text-xs text-gray-500">Pazienti prenotati: —</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Messaggio <span className="text-gray-400">(max 160 caratteri)</span>
          </label>
          <textarea
            rows={4}
            maxLength={160}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Es: Lo studio rimarrà chiuso oggi pomeriggio..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Canali</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="rounded" /> Push notification
            </label>
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          ⚠️ Questa operazione è irreversibile. Verranno notificati tutti i pazienti prenotati nel giorno selezionato.
        </div>

        <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Invia broadcast — TODO: collegare API
        </button>
      </div>
    </div>
  )
}
