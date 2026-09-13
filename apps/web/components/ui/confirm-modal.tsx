'use client'

/**
 * @file        confirm-modal.tsx
 * @module      @medico/web/components/ui
 * @description Modale di conferma per azioni critiche e distruttive (alternativa a window.confirm)
 * @author      Agent-1 | Session: 2026-09-13
 * @version     1.0.0
 */

import React, { useState } from 'react'
import { AlertTriangle, Info, Loader2, X } from 'lucide-react'

export interface ConfirmModalProps {
  isOpen: boolean
  onClose?: () => void
  onCancel?: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: string
  message?: string
  confirmText?: string
  confirmLabel?: string
  cancelText?: string
  cancelLabel?: string
  isDestructive?: boolean
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  message,
  confirmText = 'Conferma',
  confirmLabel,
  cancelText = 'Annulla',
  cancelLabel,
  isDestructive,
  variant,
  loading = false,
  isLoading,
}: ConfirmModalProps) {
  const [internalLoading, setInternalLoading] = useState(false)

  const effectiveConfirmText = confirmLabel || confirmText
  const effectiveCancelText = cancelLabel || cancelText
  const effectiveLoading = isLoading !== undefined ? isLoading : loading

  if (!isOpen) return null

  const handleClose = () => {
    if (onClose) onClose()
    else if (onCancel) onCancel()
  }

  const handleConfirm = async () => {
    try {
      setInternalLoading(true)
      await onConfirm()
    } finally {
      setInternalLoading(false)
      handleClose()
    }
  }

  const isActuallyDestructive = isDestructive ?? (variant === 'danger')
  const contentText = description || message || ''

  const isBusy = effectiveLoading || internalLoading

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isActuallyDestructive
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                  : 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/80'
              }`}
            >
              {isActuallyDestructive ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
            </div>
          </div>
          <button
            type="button"
            disabled={isBusy}
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{contentText}</p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            type="button"
            disabled={isBusy}
            onClick={handleClose}
            className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {effectiveCancelText}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={handleConfirm}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-md ${
              isActuallyDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 disabled:bg-rose-800'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 disabled:bg-indigo-800'
            }`}
          >
            {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{isBusy ? 'Operazione in corso...' : effectiveConfirmText}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
