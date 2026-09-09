/**
 * @file        page.tsx
 * @module      @medico/web/auth
 * @description Pagina di login per medico e segretario
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/ruoli/ruoli-permessi]]
 * @see         [[docs/areas/sicurezza/accesso-emergenza]]
 */

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Studio Medico</h1>
          <p className="mt-1 text-sm text-gray-500">Accedi alla dashboard</p>
        </div>

        {/* TODO: form di login con Better Auth */}
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="medico@studio.it"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Accedi
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Problemi di accesso?{' '}
          <a href="/auth/recovery" className="text-blue-600 hover:underline">
            Recupera credenziali
          </a>
        </p>
      </div>
    </main>
  )
}
