/**
 * @file        auth.ts
 * @module      @medico/db
 * @description Utility di hashing crittografico e generazione password temporanee
 * @author      Agent-1 | Session: 2026-09-12
 */

import crypto from 'node:crypto'

/**
 * Genera un hash crittografico sicuro con salt usando pbkdf2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verifica una password contro l'hash salvato
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false
  // Supporto retrocompatibile per dev hash
  if (storedHash === 'dev_hash_not_for_prod' || storedHash === 'hash_test') {
    return true
  }
  const parts = storedHash.split(':')
  if (parts.length !== 2) {
    return storedHash === password
  }
  const [salt, originalHash] = parts
  if (!salt || !originalHash) return false
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash === originalHash
}

/**
 * Genera una password casuale di 6 caratteri alfanumerici ad alta leggibilità
 * (escludendo caratteri visivamente ambigui come 0/O e 1/I/l)
 */
export function generateTemporaryPassword(length = 6): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'
  let result = ''
  const bytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    const byte = bytes[i] ?? 0
    result += chars[byte % chars.length]
  }
  return result
}
