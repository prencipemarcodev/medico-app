/**
 * @file        index.tsx
 * @module      @medico/mobile/tabs
 * @description Dashboard paziente — prossimo appuntamento, richieste in corso
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/interfaccia/ux-flows#Flow-5]]
 */

import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import { Link } from 'expo-router'

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-blue-600 px-6 pb-8 pt-6">
          <Text className="text-lg font-semibold text-blue-100">Ciao,</Text>
          <Text className="text-2xl font-bold text-white">Mario Rossi 👋</Text>
          <Text className="mt-1 text-sm text-blue-200">Dott. Nome Cognome — tuo medico</Text>
        </View>

        <View className="px-6 py-6 space-y-5" style={{ gap: 16 }}>
          {/* Prossimo appuntamento */}
          <View className="rounded-2xl bg-white p-5 shadow-sm">
            <Text className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Prossimo Appuntamento
            </Text>
            <View className="rounded-xl bg-blue-50 p-4">
              <Text className="text-base font-semibold text-blue-900">Nessun appuntamento</Text>
              <Text className="mt-0.5 text-sm text-blue-600">Prenota la tua prossima visita</Text>
            </View>
            <Link href="/(tabs)/prenota" asChild>
              <TouchableOpacity className="mt-3 rounded-xl bg-blue-600 py-3">
                <Text className="text-center text-sm font-semibold text-white">+ Prenota Visita</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Richieste in corso */}
          <View className="rounded-2xl bg-white p-5 shadow-sm">
            <Text className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Richieste in Corso
            </Text>
            <Text className="text-sm text-gray-400">Nessuna richiesta attiva — TODO: API</Text>
            <Link href="/(tabs)/richieste" asChild>
              <TouchableOpacity className="mt-3 rounded-xl border border-blue-200 py-3">
                <Text className="text-center text-sm font-semibold text-blue-600">+ Nuova Richiesta</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
