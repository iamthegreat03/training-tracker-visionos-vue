// patch-bnav-nuclear.mjs
// node patch-bnav-nuclear.mjs
// Reads main.css line by line and makes surgical replacements

import { readFileSync, writeFileSync } from 'fs'

let css = readFileSync('./src/assets/main.css', 'utf8')

// Print what we're working with
console.log('File size:', css.length, 'chars')
console.log('Contains display: none in #bnav:', css.includes('display: none'))
console.log('Contains body.authed #bnav:', css.includes('body.authed'))

// ── Fix 1: Remove display:none from #bnav block ──────────────────────────
// Find the exact line and remove it
const lines = css.split('\n')
let fixed = []
let insideBnav = false
let braceDepth = 0
let skipNextDisplayNone = false

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const trimmed = line.trim()

  // Detect entering #bnav block (but not #bnav-inner)
  if (trimmed.match(/^#bnav\s*\{/) && !trimmed.includes('inner')) {
    insideBnav = true
    braceDepth = 1
    skipNextDisplayNone = true
  } else if (insideBnav) {
    braceDepth += (line.match(/\{/g) || []).length
    braceDepth -= (line.match(/\}/g) || []).length
    if (braceDepth <= 0) insideBnav = false
    // Skip the display:none line inside #bnav
    if (skipNextDisplayNone && trimmed.includes('display: none')) {
      console.log(`  Removed line ${i + 1}: "${trimmed}"`)
      skipNextDisplayNone = false
      continue
    }
  }

  fixed.push(line)
}

css = fixed.join('\n')

// ── Fix 2: Replace body.authed #bnav rule with plain #bnav rule ──────────
// Use regex to find it regardless of whitespace
const authedPattern = /@media\s*\(max-width\s*:\s*640px\s*\)\s*\{[^}]*body\.authed\s+#bnav\s*\{[^}]*\}[^}]*\}/
const authedMatch = css.match(authedPattern)
console.log('body.authed rule found:', !!authedMatch)
if (authedMatch) {
  console.log('  Found:', authedMatch[0].substring(0, 100))
  css = css.replace(authedPattern, `@media(max-width:640px) {
            #bnav {
                display: flex
            }
        }`)
  console.log('  Replaced with: display:flex rule for #bnav on mobile')
}

// ── Fix 3: Fix #page mobile padding to clear the bottom nav ─────────────
// Find the mobile #page padding rule and update it
css = css.replace(
  /#page\s*\{\s*\n\s*padding:\s*12px\s+10px\s+80px/,
  `#page {
                padding: 12px 10px calc(60px + env(safe-area-inset-bottom, 0px))`
)

// Also try with 64px variant from previous patches
css = css.replace(
  /#page\s*\{\s*\n\s*padding:\s*12px\s+10px\s+calc\(64px[^)]*\)/,
  `#page {
                padding: 12px 10px calc(60px + env(safe-area-inset-bottom, 0px))`
)

// ── Fix 4: Modal footer padding fix ─────────────────────────────────────
// mdl-ft on mobile has padding:30px which pushes buttons down
css = css.replace(
  /\.mdl-ft\s*\{\s*\n\s*padding:\s*30px\s+22px/,
  `.mdl-ft {
                padding: 14px 14px calc(14px + env(safe-area-inset-bottom, 0px))`
)

// ── Fix 5: #bnav safe area padding ──────────────────────────────────────
// Make sure #bnav itself has safe area padding
css = css.replace(
  /padding-bottom:\s*max\(env\(safe-area-inset-bottom\),\s*8px\)/,
  `padding-bottom: env(safe-area-inset-bottom, 0px)`
)

// ── Verify ───────────────────────────────────────────────────────────────
const checks = [
  ['#bnav display:none removed', !css.match(/#bnav\s*\{[^}]*display:\s*none/)],
  ['Mobile shows #bnav', css.includes('#bnav {\n                display: flex')],
  ['body.authed removed', !css.includes('body.authed')],
]

console.log('\nVerification:')
let allGood = true
for (const [label, pass] of checks) {
  console.log(`  ${pass ? '✓' : '✗'} ${label}`)
  if (!pass) allGood = false
}

writeFileSync('./src/assets/main.css', css)
console.log('\n✓ main.css saved')

// Print the #bnav section to confirm
const start = css.indexOf('#bnav {')
const end = css.indexOf('}', start) + 1
console.log('\n#bnav block now reads:')
console.log(css.substring(start, end))

if (allGood) {
  console.log('\n✅ All good!')
  console.log('  git add src/assets/main.css')
  console.log('  git commit -m "fix(bnav): remove display:none, show on mobile"')
  console.log('  git push')
} else {
  console.log('\n⚠ Some checks failed — paste full output to Claude')
}
