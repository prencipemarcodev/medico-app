/**
 * @file        index.tsx
 * @module      @medico/mobile/auth
 * @description Schermata di login paziente
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/interfaccia/ux-flows#Flow-1]]
 */

import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native'
import { Link } from 'expo-router'

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        {/* Logo / Header */}
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-blue-600">🏥</Text>
          <Text className="mt-2 text-2xl font-bold text-gray-900">Studio Medico</Text>
          <Text className="mt-1 text-sm text-gray-500">Accedi al tuo account</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Email</Text>
            <TextInput
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base"
              placeholder="la-tua@email.it"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Password</Text>
            <TextInput
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base"
              placeholder="••••••••"
              secureTextEntry
            />
          </View>

          {/* TODO: collegare a Better Auth */}
          <TouchableOpacity className="mt-2 rounded-xl bg-blue-600 py-4">
            <Text className="text-center font-semibold text-white">Accedi</Text>
          </TouchableOpacity>
        </View>

        {/* Link registrazione */}
        <View className="mt-6 flex-row justify-center gap-1">
          <Text className="text-sm text-gray-500">Non hai un account?</Text>
          <Link href="/(auth)/register" className="text-sm font-medium text-blue-600">
            Registrati
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}
