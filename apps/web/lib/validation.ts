/**
 * @file        validation.ts
 * @module      @medico/web/lib
 * @description Helper di validazione per form sanitari (Codice Fiscale, email, telefono, password)
 * @author      Agent-1 | Session: 2026-09-13
 * @version     1.0.0
 */

/**
 * Validazione Codice Fiscale italiano (16 caratteri alfanumerici)
 */
export function validateCodiceFiscale(cf: string): { valid: boolean; error?: string } {
  const clean = (cf || '').trim().toUpperCase()
  if (!clean) {
    return { valid: false, error: 'Il Codice Fiscale è obbligatorio' }
  }
  if (clean.length !== 16) {
    return {
      valid: false,
      error: `Il Codice Fiscale deve contenere esattamente 16 caratteri (attualmente ${clean.length})`,
    }
  }
  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
  if (!cfRegex.test(clean)) {
    return {
      valid: false,
      error: 'Formato non valido. Esempio corretto: RSSMRA80A01H501U',
    }
  }
  return { valid: true }
}

/**
 * Validazione indirizzo email
 */
export function validateEmail(email: string, required = true): { valid: boolean; error?: string } {
  const clean = (email || '').trim()
  if (!clean) {
    if (required) return { valid: false, error: "L'indirizzo email è obbligatorio" }
    return { valid: true }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(clean)) {
    return { valid: false, error: 'Inserisci un indirizzo email valido (es. nome@dominio.it)' }
  }
  return { valid: true }
}

/**
 * Validazione numero di telefono (cellulare o fisso)
 */
export function validateTelefono(tel: string, required = true): { valid: boolean; error?: string } {
  const clean = (tel || '').trim().replace(/[\s\-\.\(\)]/g, '')
  if (!clean) {
    if (required) return { valid: false, error: 'Il recapito telefonico è obbligatorio' }
    return { valid: true }
  }
  const phoneRegex = /^(\+39)?3\d{8,9}$|^(\+39)?0\d{6,10}$|^\+?[0-9]{8,15}$/
  if (!phoneRegex.test(clean)) {
    return { valid: false, error: 'Inserisci un numero di telefono valido (es. 340 1234567)' }
  }
  return { valid: true }
}

/**
 * Validazione password
 */
export function validatePassword(password: string, minLength = 8): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'La password è obbligatoria' }
  }
  if (password.length < minLength) {
    return { valid: false, error: `La password deve contenere almeno ${minLength} caratteri` }
  }
  return { valid: true }
}

/**
 * Validazione campo testo generico obbligatorio
 */
export function validateRequired(value: string, fieldName = 'Questo campo', minLen = 2): { valid: boolean; error?: string } {
  const clean = (value || '').trim()
  if (!clean) {
    return { valid: false, error: `${fieldName} è obbligatorio` }
  }
  if (clean.length < minLen) {
    return { valid: false, error: `${fieldName} deve contenere almeno ${minLen} caratteri` }
  }
  return { valid: true }
}
