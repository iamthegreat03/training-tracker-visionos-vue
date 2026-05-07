// generate-icons.mjs
// Run once: node generate-icons.mjs
// Outputs: public/icons/pwa-192x192.png and public/icons/pwa-512x512.png
// Requires: npm install canvas (or use the built-in if available)

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#6366f1'
  ctx.fillRect(0, 0, size, size)

  // "PT" text
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.round(size * 0.42)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('PT', size / 2, size / 2)

  return canvas.toBuffer('image/png')
}

const dir = join(__dirname, 'public', 'icons')
mkdirSync(dir, { recursive: true })

writeFileSync(join(dir, 'pwa-192x192.png'), generateIcon(192))
writeFileSync(join(dir, 'pwa-512x512.png'), generateIcon(512))

console.log('✓ Icons generated in public/icons/')
