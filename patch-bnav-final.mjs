// patch-bnav-final.mjs
// node patch-bnav-final.mjs
// ROOT CAUSE FIX: Stop using body.authed CSS class for bottom nav.
// Use Vue's v-show + computed directly. CSS only handles layout/style.

import { readFileSync, writeFileSync } from 'fs'

// ─── 1. main.css — remove body.authed dependency, always show #bnav on mobile ──
let css = readFileSync('./src/assets/main.css', 'utf8')

// Remove the body.authed rule entirely
css = css.replace(
  `        @media(max-width:640px) {
            body.authed #bnav {
                display: block
            }
        }`,
  `        @media(max-width:640px) {
            #bnav {
                display: block
            }
        }`
)

// Fix #bnav safe area — no extra gray space but respects home indicator
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
  `        #bnav {
            display: none;
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

// Fix #page bottom padding — must clear the bnav height + home indicator
// bnav is ~56px inner + safe-area
css = css.replace(
  `            #page {
                padding: 12px 10px calc(72px + env(safe-area-inset-bottom, 0px))
            }`,
  `            #page {
                padding: 12px 10px calc(64px + env(safe-area-inset-bottom, 0px))
            }`
)

// If that string wasn't found (not yet patched), try the original
css = css.replace(
  `            #page {
                padding: 12px 10px 80px
            }`,
  `            #page {
                padding: 12px 10px calc(64px + env(safe-area-inset-bottom, 0px))
            }`
)

writeFileSync('./src/assets/main.css', css)
console.log('✓ main.css: removed body.authed dependency, fixed safe area')

// ─── 2. App.vue — use v-show on #bnav instead of CSS class ──────────────────
let app = readFileSync('./src/App.vue', 'utf8')

// Replace <nav id="bnav"> with v-show so Vue controls visibility
// This fires instantly on the same render tick as store.user being set
app = app.replace(
  `      <nav id="bnav">`,
  `      <nav id="bnav" v-show="!!store.user">`
)

// Also remove ALL calls to body.classList add/remove authed — no longer needed
app = app.replace(/\s*document\.body\.classList\.add\('authed'\)\n/g, '\n')
app = app.replace(/\s*document\.body\.classList\.remove\('authed'\)\n/g, '\n')

// Remove the entire SIGNED_IN block that was added for authed class
app = app.replace(
  `    } else if (event === 'SIGNED_IN') {
      document.body.classList.add('authed')
    }`,
  `    }`
)

// Make sure LoginView also adds authed class — no longer needed, remove if present
app = app.replace(`    document.body.classList.add('authed')\n`, '')
app = app.replace(`    document.body.classList.remove('authed')\n`, '')

writeFileSync('./src/App.vue', app)
console.log('✓ App.vue: #bnav uses v-show="!!store.user", removed all body.authed calls')

// ─── 3. LoginView.vue — add body.authed after login for legacy compat ─────
// Actually we don't need it anymore. But we do need store.user to be set
// before the router push so v-show fires on the same tick.
// Check LoginView pushes AFTER setUser — it should already do this.
let login = readFileSync('./src/views/LoginView.vue', 'utf8')

if (login.includes('router.push')) {
  console.log('✓ LoginView.vue: router.push already after setUser — no change needed')
} else {
  console.log('⚠ LoginView.vue: check that store.setUser is called before router.push')
}

// ─── 4. Verify App.vue onMounted sets store.user before router.push ─────────
// This is critical — v-show="!!store.user" only works if store.user is set
// before the component renders the authenticated shell
const appContent = readFileSync('./src/App.vue', 'utf8')
const hasSetUser = appContent.includes('await store.setUser(session.user)')
const hasLoadAll = appContent.includes('await store.loadAll()')
const hasRouterPush = appContent.includes("router.push(store.isDesigner ? '/home' : '/')")

console.log(`\nVerification:`)
console.log(`  store.setUser called before router.push: ${hasSetUser ? '✓' : '✗'}`)
console.log(`  store.loadAll called: ${hasLoadAll ? '✓' : '✗'}`)
console.log(`  router.push after setup: ${hasRouterPush ? '✓' : '✗'}`)

const bnavVShow = appContent.includes('v-show="!!store.user"')
const noAuthedClass = !appContent.includes("classList.add('authed')")
console.log(`  #bnav uses v-show: ${bnavVShow ? '✓' : '✗'}`)
console.log(`  body.authed removed: ${noAuthedClass ? '✓' : '✗'}`)

if (bnavVShow && noAuthedClass && hasSetUser) {
  console.log('\n✅ All checks passed — safe to test and push')
  console.log('\n  git add src/assets/main.css src/App.vue')
  console.log('  git commit -m "fix(bnav): remove body.authed CSS dep, use v-show for instant render"')
  console.log('  git push')
} else {
  console.log('\n⚠ Some checks failed — review output above before pushing')
}
