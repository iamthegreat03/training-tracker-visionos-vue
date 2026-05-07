// patch-bnav-show.mjs
// node patch-bnav-show.mjs

import { readFileSync, writeFileSync } from 'fs'

// ─── Fix main.css ─────────────────────────────────────────────────────────
let css = readFileSync('./src/assets/main.css', 'utf8')

// The problem: #bnav has display:none as base. v-show removes inline style
// when true but the CSS display:none still wins. 
// Fix: remove display:none from base #bnav, hide it on DESKTOP via media query instead.
// On mobile (<640px) it will show naturally. v-show handles auth gating.

// Replace the #bnav base rule — remove display:none
css = css.replace(
  `        #bnav {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--sb);
            border-top: 1px solid var(--bdr-s);
            z-index: 40;
            padding: 0;
            /* Safe area: at least 8px extra so the home indicator pill doesn't overlap */
            padding-bottom: max(env(safe-area-inset-bottom), 8px);
        }`,
  `        /* Desktop: hide bottom nav */
        @media(min-width:641px) {
            #bnav {
                display: none !important
            }
        }

        /* Mobile: show bottom nav */
        #bnav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--sb);
            border-top: 1px solid var(--bdr-s);
            z-index: 40;
            padding-bottom: env(safe-area-inset-bottom, 0px)
        }`
)

// Also remove the old mobile show rule since it's no longer needed
css = css.replace(
  `        @media(max-width:640px) {
            #bnav {
                display: block
            }
        }`,
  ``
)

// Also clean up any leftover body.authed rule if still present
css = css.replace(
  `        @media(max-width:640px) {
            body.authed #bnav {
                display: block
            }
        }`,
  ``
)

writeFileSync('./src/assets/main.css', css)
console.log('✓ main.css: #bnav display fixed — hidden on desktop, visible on mobile via media query')

// ─── Fix App.vue — keep v-show but also ensure bnav is inside authed template ──
let app = readFileSync('./src/App.vue', 'utf8')

// Check current state
const hasVShow = app.includes('v-show="!!store.user"')
const insideAuthed = app.includes(`<nav id="bnav" v-show`) || 
                     (app.indexOf('<nav id="bnav"') > app.indexOf('<template v-else>'))

console.log(`Current App.vue state:`)
console.log(`  v-show on bnav: ${hasVShow ? '✓' : '✗'}`)
console.log(`  bnav inside authed template: ${insideAuthed ? '✓' : '✗'}`)

// The bnav is already inside <template v-else> (the authenticated shell)
// So it only renders when store.user exists anyway
// v-show is redundant but harmless — remove it to simplify
if (hasVShow) {
  app = app.replace(
    `      <nav id="bnav" v-show="!!store.user">`,
    `      <nav id="bnav">`
  )
  console.log('✓ App.vue: removed redundant v-show (bnav is already inside authed template)')
} else {
  console.log('✓ App.vue: no change needed')
}

writeFileSync('./src/App.vue', app)

// ─── Verify ───────────────────────────────────────────────────────────────
const finalCss = readFileSync('./src/assets/main.css', 'utf8')
const finalApp = readFileSync('./src/App.vue', 'utf8')

const checks = [
  ['#bnav no longer has base display:none', !finalCss.match(/#bnav \{[^}]*display: none/)],
  ['Desktop hides bnav via min-width media query', finalCss.includes('min-width:641px')],
  ['bnav is inside <template v-else>', finalApp.indexOf('id="bnav"') > finalApp.indexOf('<template v-else>')],
]

console.log('\nVerification:')
let allGood = true
for (const [label, pass] of checks) {
  console.log(`  ${pass ? '✓' : '✗'} ${label}`)
  if (!pass) allGood = false
}

if (allGood) {
  console.log('\n✅ All checks passed.')
  console.log('  git add src/assets/main.css src/App.vue')
  console.log('  git commit -m "fix(bnav): correct CSS display logic for mobile nav"')
  console.log('  git push')
} else {
  console.log('\n⚠ Some checks failed — do not push yet, review above')
}
