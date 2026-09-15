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
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss()
    }, 220)
  }

  useEffect(() => {
    const duration = toast.duration || 3500
    const interval = 20
    const step = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          handleDismiss()
          return 0
        }
        return prev - step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [toast.duration])

  const iconBadges = {
    success: (
      <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-xs">
        <CheckCircle2 className="h-5 w-5" />
      </div>
    ),
    error: (
      <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-xs">
        <AlertCircle className="h-5 w-5" />
      </div>
    ),
    warning: (
      <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-xs">
        <AlertTriangle className="h-5 w-5" />
      </div>
    ),
    info: (
      <div className="h-9 w-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center flex-shrink-0 shadow-xs">
        <Info className="h-5 w-5" />
      </div>
    ),
  }

  const borderAccent = {
    success: 'border-emerald-500/30 ring-1 ring-emerald-500/10 shadow-emerald-500/5',
    error: 'border-rose-500/30 ring-1 ring-rose-500/10 shadow-rose-500/5',
    warning: 'border-amber-500/30 ring-1 ring-amber-500/10 shadow-amber-500/5',
    info: 'border-sky-500/30 ring-1 ring-sky-500/10 shadow-sky-500/5',
  }

  const progressBarColor = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
  }

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border bg-white/95 backdrop-blur-xl p-4 shadow-2xl transition-all duration-300 ${
        isExiting
          ? 'opacity-0 translate-x-8 scale-95 duration-200'
          : 'animate-fade-in-up sm:animate-slide-in-right opacity-100 translate-x-0'
      } ${borderAccent[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        {iconBadges[toast.type]}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug break-words">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed break-words font-medium">
              {toast.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
          title="Chiudi notifica"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress timer bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
        <div
          className={`h-full transition-all linear duration-100 ${progressBarColor[toast.type]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
