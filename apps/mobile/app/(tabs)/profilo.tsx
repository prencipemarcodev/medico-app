/**
 * @file        profilo.tsx
 * @module      @medico/mobile/tabs
 * @description Profilo paziente e impostazioni notifiche
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/sicurezza/privacy-gdpr#Diritti-degli-Interessati]]
 */

import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'

export default function ProfiloScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100 px-6 py-4">
        <Text className="text-xl font-bold text-gray-900">Il Mio Profilo</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-5" showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View className="items-center py-6">
          <View className="h-20 w-20 rounded-full bg-blue-100 items-center justify-center">
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text className="mt-3 text-lg font-bold text-gray-900">Mario Rossi</Text>
          <Text className="text-sm text-gray-500">mario@email.it</Text>
          <Text className="mt-1 text-xs text-blue-600">Medico: Dott. Nome Cognome</Text>
        </View>

        {/* Sezioni */}
        {[
          { label: 'Dati Personali', icon: '📝' },
          { label: 'Notifiche e Promemoria', icon: '🔔' },
          { label: 'Privacy e Consensi', icon: '🔒' },
          { label: 'Storico Prenotazioni', icon: '📅' },
          { label: 'Esporta i miei dati', icon: '📤' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            className="mb-2 flex-row items-center gap-4 rounded-xl bg-white px-4 py-4 border border-gray-100"
            style={{ gap: 12 }}
          >
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            <Text className="flex-1 text-sm font-medium text-gray-800">{item.label}</Text>
            <Text className="text-gray-300 text-lg">›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity className="mt-4 rounded-xl border border-red-200 py-4">
          <Text className="text-center text-sm font-medium text-red-600">Esci dall'account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
