'use client'

/**
 * @file        skeleton.tsx
 * @module      @medico/web/components/ui
 * @description Componenti Skeleton di caricamento per evitare schermate bianche e salti di layout (RULES.md Regola 9)
 * @author      Agent-1 | Session: 2026-09-13
 * @version     1.0.0
 */

import React from 'react'

export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-800/60 dark:bg-slate-800/60 ${className}`}
      {...props}
    />
  )
}

/**
 * Skeleton per le Card degli Studi, Medici e Personale
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4 animate-pulse shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 pr-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-850">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton per righe di tabelle dati
 */
export function TableRowsSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-slate-800/60 animate-pulse">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="py-3 px-3.5">
              <Skeleton
                className={`h-3.5 ${
                  c === 0 ? 'w-24' : c === 1 ? 'w-32' : c === 2 ? 'w-16' : c === 3 ? 'w-20' : 'w-full max-w-[120px]'
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/**
 * Skeleton per la lista degli assistiti nella barra laterale
 */
export function PatientListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3.5 rounded-xl border border-slate-800/70 bg-slate-900/40 space-y-2 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-40" />
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton per documenti clinici e referti
 */
export function DocumentCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 space-y-3 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 flex-1 pr-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded" />
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
