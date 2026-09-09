/**
 * @file        page.tsx
 * @module      @medico/web/dashboard/richieste
 * @description Coda FIFO richieste speciali (malattia, certificati, medicinali)
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/interfaccia/ux-flows#View-2]]
 * @see         [[docs/areas/architettura/decisioni-architetturali#ADR-004]]
 */

const TIPO_LABEL: Record<string, string> = {
  malattia:    '🤒 Malattia',
  certificato: '📋 Certificato',
  medicinale:  '💊 Medicinale',
}

export default function RichiestePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Richieste Speciali</h1>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
          0 in attesa
        </span>
      </div>

      {/* Filtri */}
      <div className="flex gap-2">
        {['Tutte', 'In attesa', 'In lavorazione', 'Completate', 'Rifiutate'].map((f) => (
          <button
            key={f}
            className="rounded-full border border-gray-200 px-3 py-1 text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Coda FIFO — TODO: collegare API */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3 text-sm font-medium text-gray-500">
          Coda richieste (ordine di arrivo)
        </div>
        <div className="flex items-center justify-center py-16 text-sm text-gray-400">
          Nessuna richiesta in attesa — TODO: collegare API
        </div>
      </div>
    </div>
  )
}
