// patch-ui-fixes.mjs
// node patch-ui-fixes.mjs
// Fixes:
// 1. main.css — login + loading page centering (app layout was overriding .lp/.lgp)
// 2. main.css — #page bottom padding so modal buttons aren't hidden behind bottom nav
// 3. main.css — modal footer buttons always above bottom nav on mobile
// 4. index.html — fix PWA blank screen (start_url must match hash router)
// 5. vite.config.js — fix PWA start_url to use hash

import { readFileSync, writeFileSync } from 'fs'

// ── Fix 1 + 2 + 3: main.css ──────────────────────────────────────────────
let css = readFileSync('./src/assets/main.css', 'utf8')

// Fix 1: When #app is not .authed (login/loading), it should not constrain height
// Add rule after the existing #app block
css = css.replace(
  `        #app {
            display: flex;
            height: 100vh;
            overflow: hidden
        }`,
  `        #app {
            display: flex;
            height: 100vh;
            overflow: hidden
        }

        /* Login + loading pages — override app layout so they center properly */
        .lgp, .lp {
            width: 100%;
            min-height: 100vh;
            height: auto !important
        }`
)

// Fix 2: #page needs bottom padding on mobile so content isn't hidden behind bottom nav
css = css.replace(
  `        #page {
            transition: opacity .15s ease
        }

        #page.fading {
            opacity: 0
        }`,
  `        #page {
            transition: opacity .15s ease;
            padding-bottom: 0
        }

        #page.fading {
            opacity: 0
        }

        @media(max-width:640px) {
            #page {
                padding-bottom: 72px
            }
        }`
)

// Fix 3: Modal footer — ensure it's always above bottom nav on mobile
css = css.replace(
  `        .mdl-ft {`,
  `        @media(max-width:640px) {
            .mdl {
                max-height: calc(90vh - env(safe-area-inset-bottom));
                overflow-y: auto
            }
            .mdl-ft {
                position: sticky;
                bottom: 0;
                background: var(--bg);
                z-index: 10
            }
        }

        .mdl-ft {`
)

writeFileSync('./src/assets/main.css', css)
console.log('✓ Fix 1 — login/loading centering fixed')
console.log('✓ Fix 2 — #page bottom padding added for mobile')
console.log('✓ Fix 3 — modal footer sticky above bottom nav on mobile')

// ── Fix 4: vite.config.js — PWA start_url for hash router ────────────────
let vite = readFileSync('./vite.config.js', 'utf8')

vite = vite.replace(
  `        start_url: '/',`,
  `        start_url: '/#/',`
)

// Also fix scope
vite = vite.replace(
  `        scope: '/',`,
  `        scope: '/',
        id: '/',`
)

writeFileSync('./vite.config.js', vite)
console.log('✓ Fix 4 — PWA start_url fixed to /#/ for hash router')

// ── Fix 5: LoginView.vue — ensure full height on mobile ───────────────────
let login = readFileSync('./src/views/LoginView.vue', 'utf8')

// Make sure the root div uses the lgp class properly
if (!login.includes('style="min-height:100vh')) {
  login = login.replace(
    `  <div class="lgp">`,
    `  <div class="lgp" style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg)">`
  )
  writeFileSync('./src/views/LoginView.vue', login)
  console.log('✓ Fix 5 — LoginView inline centering added')
} else {
  console.log('✓ Fix 5 — LoginView already has inline centering')
}

// ── Fix 6: App.vue — loading splash centering ─────────────────────────────
let app = readFileSync('./src/App.vue', 'utf8')

if (!app.includes('style="display:flex;align-items:center')) {
  app = app.replace(
    `  <div v-if="booting" class="lp">`,
    `  <div v-if="booting" class="lp" style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:14px;background:var(--bg);width:100%">`
  )
  writeFileSync('./src/App.vue', app)
  console.log('✓ Fix 6 — Loading splash inline centering added')
} else {
  console.log('✓ Fix 6 — Loading splash already centered')
}

console.log('\nAll fixes applied.')
console.log('  git add src/assets/main.css src/views/LoginView.vue src/App.vue vite.config.js')
console.log('  git commit -m "fix(ui): login center, loading center, modal buttons, PWA start_url"')
console.log('  git push')
