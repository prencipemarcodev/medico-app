/**
 * @file        page.tsx
 * @module      @medico/web/dashboard
 * @description Dashboard principale — riepilogo giornaliero
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 */

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Buongiorno 👋</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Appuntamenti oggi', value: '—', color: 'blue' },
          { label: 'Richieste in attesa', value: '—', color: 'amber' },
          { label: 'Slot liberi oggi', value: '—', color: 'green' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* TODO: agenda di oggi in anteprima */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
        <h2 className="mb-4 font-semibold text-gray-800">Prossimi appuntamenti</h2>
        <p className="text-sm text-gray-400">Nessun appuntamento caricato — TODO</p>
      </div>
    </div>
  )
}
