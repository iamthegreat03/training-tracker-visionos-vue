// patch-mobile-fixes.mjs
// node patch-mobile-fixes.mjs

import { readFileSync, writeFileSync } from 'fs'

// ─── Fix 1: main.css ─────────────────────────────────────────────────────
let css = readFileSync('./src/assets/main.css', 'utf8')

// 1a. Login + loading: force full-screen centering independent of #app
// The issue: #app has height:100vh + overflow:hidden which collapses children
// Fix: when body does NOT have .authed, #app should not constrain layout
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

        /* When not authenticated, app is just a transparent wrapper */
        body:not(.authed) #app {
            display: block;
            height: auto;
            overflow: visible
        }`
)

// 1b. Modal fix: backdrop covers full screen including bottom nav area
// modal body should scroll and footer must always be visible above safe area
css = css.replace(
  `        .mdl-bd {`,
  `        /* Mobile: modal must scroll internally and footer must stay above bottom nav */
        @media(max-width:640px) {
            .bkd {
                padding-bottom: max(env(safe-area-inset-bottom, 0px), 0px)
            }
            .mdl {
                max-height: 85vh;
                display: flex;
                flex-direction: column
            }
            .mdl-bd {
                flex: 1;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch
            }
            .mdl-ft {
                flex-shrink: 0;
                padding-bottom: max(env(safe-area-inset-bottom, 0px), 12px)
            }
        }

        .mdl-bd {`
)

// 1c. #page bottom padding so content doesn't hide under bottom nav
// Only add if not already there
if (!css.includes('padding-bottom: 72px')) {
  css = css.replace(
    `        #page {
            transition: opacity .15s ease
        }`,
    `        #page {
            transition: opacity .15s ease
        }

        @media(max-width:640px) {
            body.authed #page {
                padding-bottom: 72px
            }
        }`
  )
}

writeFileSync('./src/assets/main.css', css)
console.log('✓ main.css: login/loading centering, modal footer, page bottom padding')

// ─── Fix 2: App.vue ───────────────────────────────────────────────────────
let app = readFileSync('./src/App.vue', 'utf8')

// 2a. Loading splash — add explicit centering inline
app = app.replace(
  `  <div v-if="booting" class="lp">`,
  `  <div v-if="booting" style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:14px;background:var(--bg);width:100vw">`
)

// 2b. Bottom nav: add "More" tab for trainers (shows designers/teams/users)
// Replace the bottomNav computed to add More tab for trainer role
app = app.replace(
  `const bottomNav = computed(() => {
  if (store.isDesigner) return desNav
  return [
    { to: '/',           label: 'Home',    icon: ICON.dashboard },
    { to: '/attendance', label: 'Attend',  icon: ICON.attendance },
    { to: '/trainings',  label: 'Training',icon: ICON.trainings },
    { to: '/skillset',   label: 'Skills',  icon: ICON.skillset },
  ]
})`,
  `const showMoreMenu = ref(false)

const bottomNav = computed(() => {
  if (store.isDesigner) return desNav
  return [
    { to: '/',           label: 'Home',    icon: ICON.dashboard },
    { to: '/attendance', label: 'Attend',  icon: ICON.attendance },
    { to: '/trainings',  label: 'Training',icon: ICON.trainings },
    { to: '/skillset',   label: 'Skills',  icon: ICON.skillset },
  ]
})`
)

// 2c. Add More button to bottom nav in template
app = app.replace(
  `        <div id="bnav-inner">
          <RouterLink v-for="item in bottomNav" :key="item.to" :to="item.to" custom v-slot="{ navigate, isActive }">
            <button class="bn-item" :class="{ on: isActive }" @click="navigate">
              <span v-html="item.icon"></span>
              <span>{{ item.label }}</span>
            </button>
          </RouterLink>
        </div>`,
  `        <div id="bnav-inner">
          <RouterLink v-for="item in bottomNav" :key="item.to" :to="item.to" custom v-slot="{ navigate, isActive }">
            <button class="bn-item" :class="{ on: isActive }" @click="navigate">
              <span v-html="item.icon"></span>
              <span>{{ item.label }}</span>
            </button>
          </RouterLink>
          <!-- More tab for trainer — shows admin pages -->
          <button v-if="store.isTrainer" class="bn-item"
            :class="{ on: ['/designers','/teams','/users'].includes(route.path) }"
            @click="showMoreMenu = !showMoreMenu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            <span>More</span>
          </button>
        </div>

        <!-- More menu overlay -->
        <div v-if="showMoreMenu" style="position:fixed;inset:0;z-index:45;background:rgba(0,0,0,.6)" @click="showMoreMenu=false">
          <div style="position:absolute;bottom:56px;left:0;right:0;background:var(--sb);border-top:1px solid var(--bdr-s);padding:8px 0" @click.stop>
            <RouterLink v-for="item in adminNav" :key="item.to" :to="item.to" custom v-slot="{ navigate }">
              <button class="ni" style="width:100%;padding:14px 20px;font-size:14px;gap:14px"
                @click="navigate(); showMoreMenu=false">
                <span v-html="item.icon"></span>{{ item.label }}
              </button>
            </RouterLink>
          </div>
        </div>`
)

// 2d. PWA bnav fix: also add body.authed when auth state change fires SIGNED_IN
if (!app.includes("document.body.classList.add('authed')")) {
  app = app.replace(
    `    await store.setUser(session.user)
    await store.loadAll()
    router.push(store.isDesigner ? '/home' : '/')`,
    `    await store.setUser(session.user)
    await store.loadAll()
    document.body.classList.add('authed')
    router.push(store.isDesigner ? '/home' : '/')`
  )
}

writeFileSync('./src/App.vue', app)
console.log('✓ App.vue: loading centered, More tab added, body.authed on mount')

// ─── Fix 3: LoginView.vue — force centering ────────────────────────────────
let login = readFileSync('./src/views/LoginView.vue', 'utf8')

login = login.replace(
  `  <div class="lgp">`,
  `  <div style="min-height:100vh;width:100%;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:20px">`
)

writeFileSync('./src/views/LoginView.vue', login)
console.log('✓ LoginView.vue: centered with inline styles')

// ─── Fix 4: vite.config.js — PWA start_url for hash router ────────────────
let vite = readFileSync('./vite.config.js', 'utf8')

if (!vite.includes('/#/')) {
  vite = vite.replace(`        start_url: '/',`, `        start_url: '/#/',`)
  writeFileSync('./vite.config.js', vite)
  console.log('✓ vite.config.js: PWA start_url set to /#/')
} else {
  console.log('✓ vite.config.js: PWA start_url already correct')
}

console.log('\nAll fixes applied.')
console.log('  git add src/assets/main.css src/App.vue src/views/LoginView.vue vite.config.js')
console.log('  git commit -m "fix(mobile): bnav More tab, modal buttons, login center, PWA start_url"')
console.log('  git push')
