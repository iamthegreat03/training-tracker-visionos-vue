// patch-vite-host.mjs
// node patch-vite-host.mjs

import { readFileSync, writeFileSync } from 'fs'

const path = './vite.config.js'
let src = readFileSync(path, 'utf8')

src = src.replace(
  `export default defineConfig({
  plugins: [`,
  `export default defineConfig({
  server: {
    host: true,
    port: 5173,
  },
  plugins: [`
)

writeFileSync(path, src)
console.log('✓ vite.config.js — host:true added')
console.log('\nRun: npm run dev')
console.log('Then open the Network URL on your phone (same WiFi)')
