/**
 * @file        _layout.tsx
 * @module      @medico/mobile
 * @description Root layout Expo Router — gestione autenticazione e navigazione globale
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/interfaccia/ux-flows#Flow-1]]
 */

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  // TODO: controllare sessione autenticata
  // Se non autenticato → redirect a /(auth)
  // Se autenticato → redirect a /(tabs)

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  )
}
