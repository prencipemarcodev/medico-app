'use client'

/**
 * @file        skeleton.tsx
 * @module      @medico/web/components/ui
 * @description Suite Premium di componenti Skeleton con onde glowing dinamiche e indicatori di caricamento
 * @author      Agent-1 | Session: 2026-09-14
 * @version     2.0.0
 */

import React from 'react'
import { Sparkles } from 'lucide-react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

/**
 * Elemento Skeleton base con effetto glowing shimmer clinico ad alta rifrazione
 */
export function Skeleton({ className = '', glow = true, ...props }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl transition-all duration-300 ${
        glow ? 'skeleton-glow border border-slate-200/50' : 'bg-slate-100 animate-pulse'
      } ${className}`}
      {...props}
    />
  )
}

/**
 * Barra di progresso superiore con luce a scansione continua per chiamate in background
 */
export function LoadingBeam({ active = true, className = '' }: { active?: boolean; className?: string }) {
  if (!active) return null
  return (
    <div className={`h-1 w-full overflow-hidden loading-beam rounded-full shadow-xs ${className}`} />
  )
}

/**
 * Overlay o card di caricamento di alto livello con glowing pulse ring e messaggio clinico
 */
export function LoadingIndicator({
  message = 'Sincronizzazione clinica in corso...',
  subtext = 'Connessione sicura ai server sanitari',
  size = 'md',
  className = '',
}: {
  message?: string
  subtext?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const isSm = size === 'sm'
  const isLg = size === 'lg'

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center space-y-3.5 animate-fade-in-up ${className}`}
    >
      {/* Glowing dual-ring loader */}
      <div className="relative flex items-center justify-center">
        <div
          className={`rounded-full border-2 border-sky-200 border-t-sky-600 animate-spin ${
            isSm ? 'h-7 w-7' : isLg ? 'h-16 w-16 border-3' : 'h-11 w-11 border-2'
          }`}
        />
        <div
          className={`absolute rounded-full bg-sky-500/15 animate-radar-ping ${
            isSm ? 'h-8 w-8' : isLg ? 'h-20 w-20' : 'h-14 w-14'
          }`}
        />
        <div className="absolute flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-sky-600 shadow-xs" />
        </div>
      </div>

      <div className="space-y-1">
        <p
          className={`font-black text-slate-800 tracking-tight ${
            isSm ? 'text-xs' : isLg ? 'text-base' : 'text-sm'
          }`}
        >
          {message}
        </p>
        {subtext && (
          <p className="text-[11px] text-slate-400 font-medium">
            {subtext}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Skeleton per le Card degli Studi, Medici e Personale con estetica Clinical Sky
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card rounded-3xl p-6 border border-slate-200/90 space-y-4 shadow-sm relative overflow-hidden"
        >
          {/* Header Card con icona ed etichetta */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Skeleton className="h-12 w-12 rounded-2xl flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full flex-shrink-0" />
          </div>

          {/* Griglia Metriche / Info interne */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100">
            <div className="p-2.5 rounded-xl bg-slate-50/70 space-y-1.5 border border-slate-100/80">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/70 space-y-1.5 border border-slate-100/80">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Azioni inferiori */}
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton per righe di tabelle dati con stile moderno e celle fluide
 */
export function TableRowsSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr
          key={r}
          className="border-b border-slate-100/80 hover:bg-slate-50/50 transition-colors animate-fade-in-up"
          style={{ animationDelay: `${r * 40}ms` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="py-4 px-4">
              <div className="flex items-center gap-2.5">
                {c === 0 && <Skeleton className="h-7 w-7 rounded-xl flex-shrink-0" />}
                <Skeleton
                  className={`h-4 ${
                    c === 0
                      ? 'w-28'
                      : c === 1
                      ? 'w-36'
                      : c === 2
                      ? 'w-24'
                      : c === 3
                      ? 'w-20'
                      : c === cols - 1
                      ? 'w-16 rounded-full'
                      : 'w-full max-w-[120px]'
                  }`}
                />
              </div>
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/**
 * Skeleton per la lista degli assistiti nella barra laterale o anagrafica
 */
export function PatientListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2.5 animate-fade-in-up">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card p-4 rounded-2xl border border-slate-200/80 space-y-2.5 shadow-xs"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Skeleton className="h-8 w-8 rounded-xl flex-shrink-0" />
              <Skeleton className="h-4 w-36 flex-1" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
          </div>
          <Skeleton className="h-3 w-48" />
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton per documenti clinici, referti e note
 */
export function DocumentCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card rounded-2xl p-5 border border-slate-200/80 space-y-3.5 shadow-xs"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton per cruscotto KPI / Statistiche
 */
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card rounded-2xl p-5 border border-slate-200/80 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      ))}
    </div>
  )
}

