/**
 * @file        _layout.tsx
 * @module      @medico/mobile/auth
 * @description Layout per schermate di autenticazione (login, registrazione)
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 */

import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
    </Stack>
  )
}
