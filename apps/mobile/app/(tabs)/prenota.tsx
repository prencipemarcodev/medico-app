/**
 * @file        prenota.tsx
 * @module      @medico/mobile/tabs
 * @description Flusso prenotazione appuntamento con calendario e lock slot
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/interfaccia/ux-flows#Flow-2]]
 * @see         [[docs/areas/architettura/decisioni-architetturali#ADR-002]]
 */

import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'

const GIORNI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
const SLOT_MOCK = ['09:00', '09:20', '09:40', '10:20', '11:00', '11:20']

export default function PrenotaScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100 px-6 py-4">
        <Text className="text-xl font-bold text-gray-900">Prenota Visita</Text>
        <Text className="text-sm text-gray-500">Scegli un giorno e un orario disponibile</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-5" showsVerticalScrollIndicator={false}>
        {/* Selezione giorno */}
        <Text className="mb-3 text-sm font-semibold text-gray-700">Settimana corrente</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row gap-2" style={{ gap: 8 }}>
            {GIORNI.map((g, i) => (
              <TouchableOpacity
                key={g}
                className={`items-center rounded-2xl px-4 py-3 ${i === 2 ? 'bg-blue-600' : 'bg-white border border-gray-200'}`}
              >
                <Text className={`text-xs ${i === 2 ? 'text-blue-100' : 'text-gray-500'}`}>{g}</Text>
                <Text className={`mt-1 text-lg font-bold ${i === 2 ? 'text-white' : 'text-gray-800'}`}>{9 + i}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Slot disponibili */}
        <Text className="mb-3 text-sm font-semibold text-gray-700">Orari disponibili</Text>
        <View className="flex-row flex-wrap gap-3" style={{ gap: 10 }}>
          {SLOT_MOCK.map((ora) => (
            <TouchableOpacity
              key={ora}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3"
            >
              <Text className="font-mono text-sm font-medium text-gray-800">{ora}</Text>
              <Text className="text-xs text-gray-400">20 min</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nota lock */}
        <View className="mt-6 rounded-xl bg-amber-50 border border-amber-100 p-4">
          <Text className="text-xs text-amber-700">
            ⏱ Una volta selezionato l'orario, avrai 10 minuti per completare la prenotazione.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
