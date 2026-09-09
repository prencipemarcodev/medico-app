/**
 * @file        page.tsx
 * @module      @medico/web/dashboard/agenda
 * @description Vista agenda giornaliera con slot e prenotazioni
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/interfaccia/ux-flows#View-1]]
 */

export default function AgendaPage() {
  const oggi = new Date().toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize text-gray-900">{oggi}</h1>
        <div className="flex gap-2">
          <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50">
            ◀ Ieri
          </button>
          <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
            Oggi
          </button>
          <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50">
            Domani ▶
          </button>
        </div>
      </div>

      {/* Slot list — TODO: collegare a API */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3 text-sm font-medium text-gray-500">
          Slot del giorno
        </div>
        <div className="divide-y divide-gray-50">
          {['09:00', '09:20', '09:40', '10:00', '10:20'].map((ora) => (
            <div key={ora} className="flex items-center gap-4 px-5 py-3">
              <span className="w-12 text-sm font-mono text-gray-500">{ora}</span>
              <div className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-400">
                Slot libero — TODO: collegare API
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
