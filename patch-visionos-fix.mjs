// patch-visionos-fix.mjs — run from training-tracker-vue/ root
// node patch-visionos-fix.mjs
//
// Fixes the "Invalid end tag" error in App.vue introduced by patch-visionos.mjs
// Restores the correct sb-top / sb-brand / sb-sec structure.

import { readFileSync, writeFileSync, existsSync } from 'fs'

if (!existsSync('./src/App.vue')) {
  console.error('✗  Run this from the training-tracker-vue/ root directory.')
  process.exit(1)
}

let app = readFileSync('./src/App.vue', 'utf8')

// ── Detect and fix the broken sb-top block ────────────────────────────────
// The previous patch left orphaned closing tags inside sb-top.
// We'll replace the entire sb-top section with a clean known-good version.

// Strategy: find <nav id="sb"> ... up to the first <template v-if="store.isDesigner">
// and replace only the sb-top portion.

const BROKEN_PATTERNS = [
  // Pattern A — double-closed div from bad regex
  `        <div class="sb-top">
          <div class="sb-brand">
            <div class="sb-mark">PT</div>
            <div>
              <div class="sb-nm">Training Tracker</div>
              <div class="sb-sub">{{ store.role?.toUpperCase() }}</div>
            </div>
          </div>
        </div>
      </div>

      `,
  // Pattern B — another possible mangled form
  `        <div class="sb-top">
          <div class="sb-brand">
            <div class="sb-mark">PT</div>
            <div>
              <div class="sb-nm">Training Tracker</div>
              <div class="sb-sub">{{ store.role?.toUpperCase() }}</div>
            </div>
          </div>
        </div>
        </div>

        `,
]

const CORRECT = `        <div class="sb-top">
          <div class="sb-brand">
            <div class="sb-mark">PT</div>
            <div>
              <div class="sb-nm">Training Tracker</div>
              <div class="sb-sub">{{ store.role?.toUpperCase() }}</div>
            </div>
          </div>
        </div>

        `

let fixed = false

for (const broken of BROKEN_PATTERNS) {
  if (app.includes(broken)) {
    app = app.replace(broken, CORRECT)
    fixed = true
    console.log('✓ Found and fixed broken sb-top block (pattern match)')
    break
  }
}

// ── Fallback: nuclear replace of entire sb-top block ─────────────────────
if (!fixed) {
  // Use a broader replace that captures any variation of the sb-top block
  const sbTopRegex = /(<div class="sb-top">[\s\S]*?<\/div>\s*<\/div>)\s*(?=\s*<template v-if="store\.isDesigner">)/
  if (sbTopRegex.test(app)) {
    app = app.replace(
      sbTopRegex,
      `<div class="sb-top">
          <div class="sb-brand">
            <div class="sb-mark">PT</div>
            <div>
              <div class="sb-nm">Training Tracker</div>
              <div class="sb-sub">{{ store.role?.toUpperCase() }}</div>
            </div>
          </div>
        </div>

        `
    )
    fixed = true
    console.log('✓ Fixed sb-top block via regex fallback')
  }
}

if (!fixed) {
  console.error('✗  Could not locate the broken sb-top block.')
  console.error('   Please manually check src/App.vue around the <div class="sb-top"> section.')
  process.exit(1)
}

writeFileSync('./src/App.vue', app)

// ── Verify the fix ────────────────────────────────────────────────────────
const result = readFileSync('./src/App.vue', 'utf8')

// Count opening vs closing sb-top/sb-brand divs in that region
const sbNavStart = result.indexOf('<nav id="sb">')
const sbNavEnd   = result.indexOf('</nav>', sbNavStart)
const sbRegion   = result.slice(sbNavStart, sbNavEnd)

// Quick sanity: sb-top should open and close exactly once
const sbTopOpens  = (sbRegion.match(/<div class="sb-top">/g) || []).length
const sbTopCloses = (sbRegion.match(/<\/div>/g) || []).length

console.log(`\nVerification:`)
console.log(`  sb-top opens : ${sbTopOpens}  (expected 1)`)
console.log(`  ✓ App.vue saved`)

console.log(`
╔══════════════════════════════════════════╗
║   Fix applied! Try npm run dev again.    ║
╚══════════════════════════════════════════╝
`)
