// patch-comprehensive-mobile.mjs
// node patch-comprehensive-mobile.mjs

import { readFileSync, writeFileSync } from 'fs'

// ─── Fix 1: main.css — comprehensive mobile fixes ─────────────────────────
let css = readFileSync('./src/assets/main.css', 'utf8')

// 1a. #app login fix — add justify-content:center for login centering
css = css.replace(
  `        #app {
            display: flex;
            height: 100vh;
            overflow: hidden
        }`,
  `        #app {
            display: flex;
            height: 100vh;
            overflow: hidden;
            justify-content: center
        }

        /* Unauthenticated: let login/loading center themselves */
        body:not(.authed) #app {
            display: block;
            height: 100vh;
            overflow: hidden
        }`
)

// 1b. Modal fix — mdl-bd must scroll, mdl-ft must be fixed at bottom
// The current mobile CSS has mdl-ft with padding:30px 22px which pushes buttons down
// Replace the mobile .mdl-ft rule
css = css.replace(
  `            .mdl-ft {
                padding: 30px 22px;
                gap: 8px
            }`,
  `            .mdl-ft {
                padding: 14px 14px max(env(safe-area-inset-bottom, 0px), 14px);
                gap: 8px;
                flex-shrink: 0
            }`
)

// 1c. Modal body — must overflow-y scroll on mobile (not the page behind)
// The .mdl already has overflow:hidden — need mdl-bd to be the scroller
css = css.replace(
  `        .mdl-bd {
            padding: 22px;
            overflow-y: auto;
            flex: 1
        }`,
  `        .mdl-bd {
            padding: 22px;
            overflow-y: auto;
            flex: 1;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain
        }`
)

// 1d. Body scroll lock when modal is open — prevent background scroll
// Add touch-action none to backdrop
css = css.replace(
  `        .bkd {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, .72);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 200;
            padding: 20px;
            backdrop-filter: blur(5px);
            animation: fadeIn .15s ease
        }`,
  `        .bkd {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, .72);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 200;
            padding: 20px;
            backdrop-filter: blur(5px);
            animation: fadeIn .15s ease;
            touch-action: none;
            overflow: hidden
        }`
)

// 1e. Remove gray space at bottom — #bnav safe area and height fix
css = css.replace(
  `        #bnav {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--sb);
            border-top: 1px solid var(--bdr-s);
            z-index: 40
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

// 1f. Fix #page bottom padding to account for bnav height + safe area
css = css.replace(
  `            #page {
                padding: 12px 10px 80px
            }`,
  `            #page {
                padding: 12px 10px calc(72px + env(safe-area-inset-bottom, 0px))
            }`
)

// 1g. Teams tab — responsive grid on mobile (was 4-column fixed)
css = css.replace(
  `        }

        /* â"€â"€ iOS SAFE AREA`,
  `        }

        /* Teams grid — responsive */
        @media(max-width:640px) {
            .teams-grid {
                grid-template-columns: 1fr !important;
                gap: 0 !important
            }
        }
        @media(min-width:641px) and (max-width:900px) {
            .teams-grid {
                grid-template-columns: 1fr 1fr !important
            }
        }

        /* â"€â"€ iOS SAFE AREA`
)

writeFileSync('./src/assets/main.css', css)
console.log('✓ main.css: login centering, modal scroll/buttons, bnav safe area, teams responsive')

// ─── Fix 2: AppModal.vue — lock body scroll when modal is open ─────────────
let modal = readFileSync('./src/components/AppModal.vue', 'utf8')

modal = modal.replace(
  `onMounted(() => document.addEventListener('keydown', handleEsc))
onUnmounted(() => document.removeEventListener('keydown', handleEsc))`,
  `onMounted(() => {
  document.addEventListener('keydown', handleEsc)
  // Prevent background scroll on iOS when modal is open
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc)
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
})`
)

writeFileSync('./src/components/AppModal.vue', modal)
console.log('✓ AppModal.vue: body scroll locked when modal is open')

// ─── Fix 3: TeamsView.vue — add teams-grid class ──────────────────────────
let teams = readFileSync('./src/views/TeamsView.vue', 'utf8')

teams = teams.replace(
  `    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--bdr)">`,
  `    <div class="teams-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--bdr)">`
)

writeFileSync('./src/views/TeamsView.vue', teams)
console.log('✓ TeamsView.vue: teams-grid class added for responsive breakpoints')

// ─── Fix 4: App.vue — signout visible + topbar signout for mobile ─────────
let app = readFileSync('./src/App.vue', 'utf8')

// Add signout button to topbar (visible on mobile, since sidebar is hidden)
app = app.replace(
  `          <div id="tb-meta" style="display:flex;align-items:center;gap:10px">
            <button class="tt" @click="toggleTheme">{{ isDark ? '☀ Light' : '◑ Dark' }}</button>
          </div>`,
  `          <div id="tb-meta" style="display:flex;align-items:center;gap:10px">
            <button class="tt" @click="toggleTheme">{{ isDark ? '☀ Light' : '◑ Dark' }}</button>
            <button style="background:none;border:1px solid var(--bdr);padding:5px 10px;color:var(--t2);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.5px" @click="signOut">SIGN OUT</button>
          </div>`
)

// Make #tb-meta show on mobile too (was display:none in CSS)
// Do this by adding inline override
app = app.replace(
  `        <header id="tb">
          <span id="tb-title">{{ pageTitle }}</span>
          <div id="tb-meta" style="display:flex;align-items:center;gap:10px">`,
  `        <header id="tb">
          <span id="tb-title">{{ pageTitle }}</span>
          <div id="tb-meta" style="display:flex !important;align-items:center;gap:10px">`
)

writeFileFixed('./src/App.vue', app)
console.log('✓ App.vue: signout button added to topbar, visible on mobile')

function writeFileFixed(path, content) {
  writeFileSync(path, content)
}

// ─── Fix 5: LoginView.vue — force full-screen centering ───────────────────
let login = readFileSync('./src/views/LoginView.vue', 'utf8')

// Replace the root div with guaranteed centering
login = login.replace(
  /  <div[^>]*class="lgp"[^>]*>/,
  `  <div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:20px;overflow-y:auto">`
)

writeFileFixed('./src/views/LoginView.vue', login)
console.log('✓ LoginView.vue: position:fixed centering (always centered regardless of #app)')

// ─── Fix 6: App.vue loading splash — force centered ──────────────────────
app = readFileSync('./src/App.vue', 'utf8')

app = app.replace(
  /  <div v-if="booting"[^>]*>/,
  `  <div v-if="booting" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;background:var(--bg)">`
)

writeFileFixed('./src/App.vue', app)
console.log('✓ App.vue: loading splash position:fixed centered')

console.log('\nAll fixes applied.')
console.log('  git add src/assets/main.css src/components/AppModal.vue src/views/TeamsView.vue src/App.vue src/views/LoginView.vue')
console.log('  git commit -m "fix(mobile): login center, modal scroll, bnav safe area, teams responsive, signout"')
console.log('  git push')
