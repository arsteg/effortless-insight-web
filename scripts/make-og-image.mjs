// Generates public/og-image.png (1200x630) for social sharing.
// Reuses the brand hexagon+bolt mark and colors from public/logo.svg.
// Run: node scripts/make-og-image.mjs
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = join(__dirname, '..', 'public', 'og-image.png')

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f0f9ff"/>
    </linearGradient>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="50%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
    <linearGradient id="textAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="14" fill="url(#iconGrad)"/>

  <!-- Logo lockup -->
  <g transform="translate(90,96) scale(2.3)">
    <path d="M28 2 L50 14 L50 42 L28 54 L6 42 L6 14 Z" fill="url(#iconGrad)"/>
    <path d="M32 10 L21 28 L28 28 L24 46 L39 24 L30 24 Z" fill="white"/>
  </g>
  <text x="240" y="185" font-family="DejaVu Sans, Arial, sans-serif" font-size="60" font-weight="700" letter-spacing="-1">
    <tspan fill="#0f172a">Effortless</tspan><tspan fill="url(#textAccent)">Insight</tspan>
  </text>

  <!-- Headline -->
  <text x="90" y="360" font-family="DejaVu Sans, Arial, sans-serif" font-size="62" font-weight="700" fill="#0f172a" letter-spacing="-1">GST notices — found, explained,</text>
  <text x="90" y="440" font-family="DejaVu Sans, Arial, sans-serif" font-size="62" font-weight="700" fill="#0f172a" letter-spacing="-1">and answered on time.</text>

  <!-- Subtext -->
  <text x="90" y="512" font-family="DejaVu Sans, Arial, sans-serif" font-size="32" fill="#475569">AI-powered GST Notice Operating System for Indian businesses</text>

  <!-- Footer -->
  <text x="90" y="588" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="600" fill="#0ea5e9">effortlessinsight.in</text>
  <text x="1110" y="588" text-anchor="end" font-family="DejaVu Sans, Arial, sans-serif" font-size="26" fill="#94a3b8">Made in India</text>
</svg>`

await sharp(Buffer.from(svg)).png().toFile(out)
console.log('Wrote', out)
