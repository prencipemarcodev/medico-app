/**
 * @file        layout.tsx
 * @module      @medico/web/dashboard
 * @description Layout condiviso dashboard: sidebar + header
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/interfaccia/ux-flows#Layout-Principale]]
 */

import Link from 'next/link'

const navItems = [
  { href: '/dashboard', label: 'Panoramica', icon: '📊' },
  { href: '/dashboard/agenda', label: 'Agenda', icon: '📅' },
  { href: '/dashboard/richieste', label: 'Richieste', icon: '📋' },
  { href: '/dashboard/broadcast', label: 'Broadcast', icon: '📢' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <span className="text-lg font-semibold text-gray-900">🏥 Studio Medico</span>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Dott. Nome Cognome</span>
            <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              Esci
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
