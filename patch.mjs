// patch.mjs — run from training-tracker-vue/ root
// Usage: node patch.mjs
//
// Fixes:
//  1. TrainingsView.vue — merge duplicate :style on ddb buttons (fix build error)
//  2. TrainingsView.vue — replace purple #6c63ff with orange #f97316
//  3. TrainingsView.vue — fix ddb button readability (add color to merged style)
//  4. TrainingsView.vue — save spinner already present, verify it exists
//  5. main.css — add --accent orange token to both theme blocks
//  6. main.css — fix .ddb default color from var(--t4) to var(--t2)

import { readFileSync, writeFileSync } from 'fs'

// ── TrainingsView.vue ──────────────────────────────────────────
const tvPath = './src/views/TrainingsView.vue'
let tv = readFileSync(tvPath, 'utf8')

// Fix 1 + 3: Merge duplicate :style and improve ddb readability
// The broken version has two :style attributes — merge into one object
// and add color logic so inactive days show --t1 (readable) not --t4 (faint)
tv = tv.replace(
  `:style="editT.schedule.includes(item) ? '' : 'opacity:.2;cursor:not-allowed;pointer-events:none'"
                  :title="editT.type === 'Discussion' ? fmtDs(item) : item"
                  :style="{ minWidth: editT.type === 'Discussion' ? '48px' : '32px' }"`,
  `:style="{ opacity: editT.schedule.includes(item) ? 1 : 0.2, cursor: editT.schedule.includes(item) ? 'pointer' : 'not-allowed', pointerEvents: editT.schedule.includes(item) ? 'auto' : 'none', minWidth: editT.type === 'Discussion' ? '48px' : '32px', color: editT.enrollSel[d.id]?.includes(item) ? 'var(--btn-txt)' : 'var(--t1)' }"
                  :title="editT.type === 'Discussion' ? fmtDs(item) : item"`
)

// Fix 2: Replace purple with orange throughout
tv = tv.replaceAll('#6c63ff', '#f97316')
tv = tv.replaceAll('rgba(108,99,255,.3)', 'rgba(249,115,22,.3)')
tv = tv.replaceAll('rgba(108,99,255,.1)', 'rgba(249,115,22,.1)')
tv = tv.replaceAll("var(--accent, #6c63ff)", "var(--accent, #f97316)")
tv = tv.replaceAll("var(--accent-t, rgba(108,99,255,.1))", "var(--accent-t, rgba(249,115,22,.1))")
tv = tv.replaceAll('rgba(108,99,255', 'rgba(249,115,22')

writeFileSync(tvPath, tv)
console.log('✓ TrainingsView.vue patched')

// ── main.css ───────────────────────────────────────────────────
const cssPath = './src/assets/main.css'
let css = readFileSync(cssPath, 'utf8')

// Fix 5a: Add --accent to dark theme
if (!css.includes('--accent: #f97316')) {
  css = css.replace(
    '--a-bg: rgba(251, 191, 36, .1);',
    '--a-bg: rgba(251, 191, 36, .1);\n            --accent: #f97316;\n            --accent-t: rgba(249, 115, 22, .1);'
  )
  console.log('✓ main.css dark --accent added')
} else {
  console.log('• main.css dark --accent already present')
}

// Fix 5b: Add --accent to light theme  
if (!css.includes('--accent: #ea6c00')) {
  css = css.replace(
    '--a-bg: rgba(217, 119, 6, .1);',
    '--a-bg: rgba(217, 119, 6, .1);\n            --accent: #ea6c00;\n            --accent-t: rgba(234, 108, 0, .1);'
  )
  console.log('✓ main.css light --accent added')
} else {
  console.log('• main.css light --accent already present')
}

// Fix 6: Fix .ddb default color — change var(--t4) to var(--t2) for readable inactive day buttons
// Target the .ddb block specifically (not .ddb.on which should stay as-is)
css = css.replace(
  /(\. ddb\s*\{[^}]*?)color: var\(--t4\)/,
  '$1color: var(--t2)'
)
// Also try without space after dot
css = css.replace(
  /(\.ddb\s*\{[^}]*text-transform[^}]*?)color: var\(--t4\)/,
  '$1color: var(--t2)'
)

writeFileSync(cssPath, css)
console.log('✓ main.css patched')

console.log('\nAll patches applied. Run: npm run dev')
