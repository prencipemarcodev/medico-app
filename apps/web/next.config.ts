/**
 * @file        next.config.ts
 * @module      @medico/web
 * @description Configurazione Next.js per la web dashboard
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 */

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@medico/types'],
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
