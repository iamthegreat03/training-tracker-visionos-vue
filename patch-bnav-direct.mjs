// patch-bnav-direct.mjs
// node patch-bnav-direct.mjs
// Uses regex to find and replace the #bnav block regardless of whitespace

import { readFileSync, writeFileSync } from 'fs'

// ─── Fix main.css ─────────────────────────────────────────────────────────
let css = readFileSync('./src/assets/main.css', 'utf8')

// Show current state
const bnavBlock = css.match(/#bnav\s*\{[^}]+\}/)?.[0]
console.log('Current #bnav block found:')
console.log(bnavBlock ? bnavBlock.substring(0, 200) : 'NOT FOUND')

// Replace #bnav block using regex — handles any whitespace variation
css = css.replace(
  /#bnav\s*\{[^}]+\}/,
  `#bnav {
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

// Replace the body.authed show rule with a direct show rule (no class dependency)
const authedRule = css.match(/@media\(max-width:640px\)\s*\{[^}]*body\.authed\s+#bnav[^}]*\}/)?.[0]
console.log('\nCurrent body.authed rule found:')
console.log(authedRule ? authedRule : 'NOT FOUND')

css = css.replace(
  /@media\(max-width:640px\)\s*\{\s*body\.authed\s+#bnav\s*\{[^}]*\}\s*\}/,
  `@media(max-width:640px) {
            #bnav {
                display: flex !important
            }
        }`
)

// Verify changes
const newBnavBlock = css.match(/#bnav\s*\{[^}]+\}/)?.[0]
const newShowRule = css.includes('#bnav {\n                display: flex !important')
const noDisplayNone = !newBnavBlock?.includes('display: none')

console.log('\nAfter patch:')
console.log('  #bnav block no longer has display:none:', noDisplayNone ? '✓' : '✗')
console.log('  Mobile show rule updated:', newShowRule ? '✓' : '✗')

writeFileSync('./src/assets/main.css', css)
console.log('\n✓ main.css written')

// ─── Fix App.vue — remove v-show if present, bnav is inside authed template ──
let app = readFileSync('./src/App.vue', 'utf8')

// Remove v-show if it was added
app = app.replace(`      <nav id="bnav" v-show="!!store.user">`, `      <nav id="bnav">`)

writeFileSync('./src/App.vue', app)
console.log('✓ App.vue cleaned up')

// ─── Final verification ───────────────────────────────────────────────────
const finalCss = readFileSync('./src/assets/main.css', 'utf8')
console.log('\nFinal CSS around #bnav:')
const start = finalCss.indexOf('#bnav {')
console.log(finalCss.substring(start, start + 300))

console.log('\n--- If display:none is gone above, you are good to go ---')
console.log('  git add src/assets/main.css src/App.vue')
console.log('  git commit -m "fix(bnav): force show on mobile, remove display none"')
console.log('  git push')
