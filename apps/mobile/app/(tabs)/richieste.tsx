/**
 * @file        richieste.tsx
 * @module      @medico/mobile/tabs
 * @description Gestione richieste speciali: malattia, certificati, medicinali
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/interfaccia/ux-flows#Flow-3]]
 * @see         [[docs/areas/dominio/requisiti-funzionali#Modulo-Richieste-Speciali]]
 */

import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'

const TIPI_RICHIESTA = [
  { id: 'malattia',    label: 'Certificato Malattia', icon: '🤒', desc: 'Richiedi il certificato di malattia' },
  { id: 'certificato', label: 'Certificato Medico',   icon: '📋', desc: 'Buona salute, sportivo, scolastico...' },
  { id: 'medicinale',  label: 'Prescrizione',          icon: '💊', desc: 'Richiedi una prescrizione medica' },
]

export default function RichiesteScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100 px-6 py-4">
        <Text className="text-xl font-bold text-gray-900">Richieste Speciali</Text>
        <Text className="text-sm text-gray-500">Invia una nuova richiesta al tuo medico</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-5" showsVerticalScrollIndicator={false}>
        {/* Nuova richiesta */}
        <Text className="mb-3 text-sm font-semibold text-gray-700">Nuova Richiesta</Text>
        <View style={{ gap: 10 }}>
          {TIPI_RICHIESTA.map((tipo) => (
            <TouchableOpacity
              key={tipo.id}
              className="flex-row items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
              style={{ gap: 14 }}
            >
              <Text style={{ fontSize: 28 }}>{tipo.icon}</Text>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">{tipo.label}</Text>
                <Text className="mt-0.5 text-sm text-gray-500">{tipo.desc}</Text>
              </View>
              <Text className="text-gray-300 text-lg">›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Richieste in corso */}
        <Text className="mb-3 mt-8 text-sm font-semibold text-gray-700">Le tue richieste</Text>
        <View className="rounded-2xl bg-white p-5 border border-gray-100">
          <Text className="text-sm text-gray-400 text-center">Nessuna richiesta — TODO: API</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
