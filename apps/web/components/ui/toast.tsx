'use client'

/**
 * @file        toast.tsx
 * @module      @medico/web/components/ui
 * @description Sistema unificato di notifiche Toast non bloccanti con auto-dismiss e animazioni
 * @author      Agent-1 | Session: 2026-09-13
 * @version     1.0.0
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

export interface ToastContextValue {
  showToast: (type: ToastType, title: string, description?: string, duration?: number) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  dismiss: (id: string) => void
  toast: {
    showToast: (type: ToastType, title: string, description?: string, duration?: number) => void
    success: (title: string, description?: string) => void
    error: (title: string, description?: string) => void
    warning: (title: string, description?: string) => void
    info: (title: string, description?: string) => void
    dismiss: (id: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve essere utilizzato all\'interno di un <ToastProvider>')
  }
  return context
}

// children: any per piena compatibilità tra i tipi React 18 (@types/react) e Next.js 15 (React 19 types che includono bigint)
export function ToastProvider({ children }: { children: any }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string, duration = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const newToast: ToastItem = { id, type, title, description, duration }
      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }
    },
    [dismiss]
  )

  const success = useCallback((title: string, description?: string) => showToast('success', title, description), [showToast])
  const error = useCallback((title: string, description?: string) => showToast('error', title, description), [showToast])
  const warning = useCallback((title: string, description?: string) => showToast('warning', title, description), [showToast])
  const info = useCallback((title: string, description?: string) => showToast('info', title, description), [showToast])

  const toastMethods = { showToast, success, error, warning, info, dismiss }
  const value: ToastContextValue = {
    ...toastMethods,
    toast: toastMethods,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Viewport Floating Container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const duration = toast.duration || 3500
    const interval = 20
    const step = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [toast.duration])

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />,
    info: <Info className="h-5 w-5 text-indigo-400 flex-shrink-0" />,
  }

  const borderBg = {
    success: 'bg-slate-950/95 border-emerald-500/50 shadow-emerald-950/40 text-emerald-300',
    error: 'bg-slate-950/95 border-rose-500/50 shadow-rose-950/40 text-rose-300',
    warning: 'bg-slate-950/95 border-amber-500/50 shadow-amber-950/40 text-amber-300',
    info: 'bg-slate-950/95 border-indigo-500/50 shadow-indigo-950/40 text-indigo-300',
  }

  const progressBarColor = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-indigo-500',
  }

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden rounded-xl border p-3.5 sm:p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 sm:slide-in-from-right-4 ${borderBg[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs sm:text-sm font-bold text-white leading-snug break-words">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">
              {toast.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Chiudi notifica"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress timer bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
        <div
          className={`h-full transition-all linear ${progressBarColor[toast.type]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
