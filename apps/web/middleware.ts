import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_SECRET =
  process.env['SESSION_SECRET'] ||
  process.env['BETTER_AUTH_SECRET'] ||
  'medico-app-super-secure-production-hmac-key-256-bits-entropy'

// Helper di verifica compatibile sia con Node che con Edge Runtime (Web Crypto API)
async function verifyToken(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const [payloadB64, sigB64] = parts
    if (!payloadB64 || !sigB64) return null

    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64))
    const uint8 = new Uint8Array(sig)
    let binary = ''
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]!)
    }
    const expectedSigB64 = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    if (expectedSigB64 !== sigB64) return null

    // Decodifica JSON payload
    let b64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const jsonStr = atob(b64)
    const payload = JSON.parse(jsonStr)

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Se la rotta è statica o API, non intervenire nel middleware di routing pagine
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth_session')?.value
  const user = token ? await verifyToken(token) : null

  const isLoginPage = pathname === '/login'
  const isProtectedPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/segreteria') ||
    pathname.startsWith('/paziente')

  // 1. Utente NON autenticato che prova ad accedere a rotte protette
  if (!user && isProtectedPath) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Controllo RBAC: verifica che l'utente non acceda a portali di altri ruoli
  if (user) {
    if (pathname.startsWith('/admin') && user.ruolo !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (pathname.startsWith('/dashboard') && user.ruolo !== 'medico' && user.ruolo !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (pathname.startsWith('/segreteria') && user.ruolo !== 'segreteria' && user.ruolo !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (pathname.startsWith('/paziente') && user.ruolo !== 'paziente' && user.ruolo !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
