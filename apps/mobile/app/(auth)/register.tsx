/**
 * @file        register.tsx
 * @module      @medico/mobile/auth
 * @description Schermata di registrazione paziente con scelta medico curante
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/interfaccia/ux-flows#Flow-1]]
 * @see         [[docs/areas/sicurezza/privacy-gdpr#Consenso]]
 */

import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { Link } from 'expo-router'

export default function RegisterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        <Text className="mb-6 text-2xl font-bold text-gray-900">Crea il tuo account</Text>

        <View className="space-y-4">
          {/* Dati anagrafici */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-1 text-sm font-medium text-gray-700">Nome</Text>
              <TextInput className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base" placeholder="Mario" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-sm font-medium text-gray-700">Cognome</Text>
              <TextInput className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base" placeholder="Rossi" />
            </View>
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Data di nascita</Text>
            <TextInput className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base" placeholder="GG/MM/AAAA" />
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Codice Fiscale</Text>
            <TextInput className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base" placeholder="RSSMRA..." autoCapitalize="characters" />
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Email</Text>
            <TextInput className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base" placeholder="mario@email.it" keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Telefono</Text>
            <TextInput className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base" placeholder="+39 333 1234567" keyboardType="phone-pad" />
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Password</Text>
            <TextInput className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base" placeholder="••••••••" secureTextEntry />
          </View>

          {/* Scelta medico — TODO: caricare da API */}
          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Medico curante</Text>
            <View className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <Text className="text-gray-400 text-base">Seleziona il tuo medico — TODO</Text>
            </View>
          </View>

          {/* Consensi GDPR */}
          <View className="rounded-xl bg-blue-50 p-4 space-y-3">
            <Text className="text-sm font-medium text-blue-900">Privacy e Consensi</Text>
            <Text className="text-xs text-blue-700">
              ✅ Accetto i Termini di Servizio e l'Informativa Privacy (obbligatorio)
            </Text>
            <Text className="text-xs text-blue-600">
              ☐ Accetto di ricevere notifiche push per promemoria e aggiornamenti (opzionale)
            </Text>
          </View>

          {/* TODO: collegare a Better Auth */}
          <TouchableOpacity className="rounded-xl bg-blue-600 py-4">
            <Text className="text-center font-semibold text-white">Crea Account</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 mb-10 flex-row justify-center gap-1">
          <Text className="text-sm text-gray-500">Hai già un account?</Text>
          <Link href="/(auth)/" className="text-sm font-medium text-blue-600">Accedi</Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
