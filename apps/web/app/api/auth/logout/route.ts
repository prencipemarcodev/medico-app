import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('auth_session', '', {
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function GET(request: Request) {
  const loginUrl = new URL('/login', request.url)
  const response = NextResponse.redirect(loginUrl)
  response.cookies.set('auth_session', '', {
    path: '/',
    maxAge: 0,
  })
  return response
}
