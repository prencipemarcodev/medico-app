import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')
const iconsDir = path.join(publicDir, 'icons')

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1329" />
      <stop offset="50%" stop-color="#111c38" />
      <stop offset="100%" stop-color="#070c18" />
    </linearGradient>
    <linearGradient id="crossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0ea5e9" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#0284c7" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Sfondo squircle Apple/Android PWA iconico -->
  <rect x="12" y="12" width="488" height="488" rx="116" fill="url(#bgGrad)" stroke="#1e293b" stroke-width="4"/>

  <!-- Cerchio luce radiale di profondità -->
  <circle cx="256" cy="256" r="176" fill="none" stroke="#1e293b" stroke-width="6" opacity="0.6"/>

  <!-- Croce Medica ad angoli morbidi -->
  <g filter="url(#glow)">
    <rect x="216" y="112" width="80" height="288" rx="28" fill="url(#crossGrad)"/>
    <rect x="112" y="216" width="288" height="80" rx="28" fill="url(#crossGrad)"/>
  </g>

  <!-- Linea Elettrocardiogramma / Battito cardiaco dinamico (ECG Pulse) al centro -->
  <path d="M 112 256 L 190 256 L 212 200 L 244 320 L 272 160 L 302 336 L 322 256 L 400 256"
        fill="none"
        stroke="url(#pulseGrad)"
        stroke-width="18"
        stroke-linecap="round"
        stroke-linejoin="round"
  />

  <!-- Punto luce scintillante sul picco del battito -->
  <circle cx="272" cy="160" r="9" fill="#ffffff" filter="url(#glow)"/>
</svg>
`

async function generate() {
  const svgBuffer = Buffer.from(svgIcon.trim())

  // 1. Salva SVG originali
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgBuffer)
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgBuffer)

  // 2. Icona Apple Touch (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'))

  // 3. Icona 192x192 (PWA)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'))

  // 4. Icona 512x512 (PWA)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'))

  // 5. Icona Maskable 512x512 (PWA con padding per Android)
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: '#070c18',
    })
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512.png'))

  // 6. Favicon 32x32 e 48x48
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'))

  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'))

  console.log('✓ Icone PWA e Favicons generate con successo in apps/web/public!')
}

generate().catch(console.error)
