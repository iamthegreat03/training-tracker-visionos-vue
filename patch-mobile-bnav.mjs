// patch-mobile-bnav.mjs
// node patch-mobile-bnav.mjs
// Adds body.authed class on login (required by CSS: body.authed #bnav { display: block })

import { readFileSync, writeFileSync } from 'fs'

const path = './src/App.vue'
let src = readFileSync(path, 'utf8')

// Check if already patched
if (src.includes("document.body.classList.add('authed')")) {
  console.log('✓ Already patched — body.authed is already being set')
  process.exit(0)
}

// Add authed class after loadAll on successful login
src = src.replace(
  `    await store.setUser(session.user)
    await store.loadAll()
    router.push(store.isDesigner ? '/home' : '/')`,
  `    await store.setUser(session.user)
    await store.loadAll()
    document.body.classList.add('authed')
    router.push(store.isDesigner ? '/home' : '/')`
)

// Remove authed class on sign out
src = src.replace(
  `async function signOut() {
  await db.auth.signOut()
  store.user = null
  router.push('/login')
}`,
  `async function signOut() {
  await db.auth.signOut()
  store.user = null
  document.body.classList.remove('authed')
  router.push('/login')
}`
)

// Also add on auth state change (handles page refresh)
src = src.replace(
  `  db.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) { await store.setUser(null); router.push('/login') }
  })`,
  `  db.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      await store.setUser(null)
      document.body.classList.remove('authed')
      router.push('/login')
    } else if (event === 'SIGNED_IN') {
      document.body.classList.add('authed')
    }
  })`
)

writeFileSync(path, src)

// Verify
const result = readFileSync(path, 'utf8')
if (result.includes("document.body.classList.add('authed')")) {
  console.log('✓ body.authed class added — mobile bottom nav will now show')
} else {
  console.log('✗ Patch failed — could not find target string')
}

console.log('\n  git add src/App.vue')
console.log('  git commit -m "fix(mobile): add body.authed so bottom nav shows"')
console.log('  git push')
