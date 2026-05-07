<template>
  <div v-if="booting" class="lp">
    <div class="lp-m">PT TRACKER</div>
    <div class="spin"></div>
  </div>

  <template v-else>
    <RouterView v-if="!store.user" />

    <template v-else>
      <nav id="sb">
        <div class="sb-top">
          <div class="sb-brand">
            <div class="sb-mark">PT</div>
            <div>
              <div class="sb-nm">Training Tracker</div>
              <div class="sb-sub">{{ store.role?.toUpperCase() }}</div>
            </div>
          </div>
        </div>

        <template v-if="store.isDesigner">
          <div class="sb-sec">
            <div class="sb-lbl">Navigation</div>
            <RouterLink v-for="item in desNav" :key="item.to" :to="item.to" custom v-slot="{ navigate, isActive }">
              <button class="ni" :class="{ on: isActive }" @click="navigate">
                <span v-html="item.icon"></span> {{ item.label }}
              </button>
            </RouterLink>
          </div>
        </template>

        <template v-else>
          <div class="sb-sec">
            <div class="sb-lbl">Main</div>
            <RouterLink v-for="item in mainNav" :key="item.to" :to="item.to" custom v-slot="{ navigate, isActive }">
              <button class="ni" :class="{ on: isActive }" @click="navigate">
                <span v-html="item.icon"></span> {{ item.label }}
              </button>
            </RouterLink>
          </div>
          <div v-if="adminNav.length" class="sb-sec">
            <div class="sb-lbl">Admin</div>
            <RouterLink v-for="item in adminNav" :key="item.to" :to="item.to" custom v-slot="{ navigate, isActive }">
              <button class="ni" :class="{ on: isActive }" @click="navigate">
                <span v-html="item.icon"></span> {{ item.label }}
              </button>
            </RouterLink>
          </div>
        </template>

        <div class="sb-ft">
          <div class="u-row">
            <div class="u-av">{{ initials }}</div>
            <div style="flex:1;min-width:0">
              <div class="u-nm">{{ displayName }}</div>
              <div class="u-rl">{{ store.role }}</div>
            </div>
            <button class="btn btn-ic" style="padding:5px;color:var(--t3);flex-shrink:0" title="Sign out" @click="signOut">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
          <button class="tt" id="tt-btn" style="margin:8px 8px 0" @click="toggleTheme">
            {{ isDark ? '☀ Light' : '◑ Dark' }}
          </button>
        </div>
      </nav>

      <div id="main">
        <!-- Pull to refresh indicator -->
        <div id="ptr" :class="{ show: ptrState !== 'idle' }">
          {{ ptrState === 'refreshing' ? '⟳ REFRESHING…' : ptrState === 'release' ? '↑ RELEASE TO REFRESH' : '↓ PULL TO REFRESH' }}
        </div>

        <header id="tb">
          <span id="tb-title">{{ pageTitle }}</span>
          <div id="tb-meta" style="display:flex;align-items:center;gap:10px">
            <button class="tt" @click="toggleTheme">{{ isDark ? '☀ Light' : '◑ Dark' }}</button>
          </div>
        </header>

        <div id="page" :class="{ fading: transitioning }">
          <RouterView />
        </div>
      </div>

      <nav id="bnav">
        <div id="bnav-inner">
          <RouterLink v-for="item in bottomNav" :key="item.to" :to="item.to" custom v-slot="{ navigate, isActive }">
            <button class="bn-item" :class="{ on: isActive }" @click="navigate">
              <span v-html="item.icon"></span>
              <span>{{ item.label }}</span>
            </button>
          </RouterLink>
        </div>
      </nav>
    </template>

    <!-- Toast Container -->
    <div id="tc">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id"
          :class="t.undoCb ? 'undo-tz' : `tz tz-${t.type === 'er' ? 'er' : 'ok'}`">
          <template v-if="t.undoCb">
            <span style="flex:1">⚡ {{ t.msg }}</span>
            <button class="undo-btn" @click="doUndo(t)">{{ t.undoLabel }}</button>
          </template>
          <template v-else>
            <span class="tz-d"></span>{{ t.msg }}
          </template>
        </div>
      </TransitionGroup>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { db } from '@/lib/supabase'
import { useToast } from '@/composables/useToast'
import { usePullToRefresh } from '@/composables/usePullToRefresh'

const store  = useAppStore()
const router = useRouter()
const route  = useRoute()
const booting = ref(true)
const transitioning = ref(false)
const isDark = ref(true)

const { toasts, doUndo } = useToast()
const { ptrState } = usePullToRefresh('main', async () => { await store.loadAll() })

const ICON = {
  dashboard:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  trainings:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  attendance: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  skillset:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  designers:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  teams:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
  users:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  home:       '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  roadmap:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  history:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  badges:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>',
}

const mainNav = computed(() => {
  const items = [
    { to: '/', label: 'Dashboard', icon: ICON.dashboard },
    { to: '/trainings', label: 'Trainings', icon: ICON.trainings },
  ]
  if (!tabHidden('attendance')) items.push({ to: '/attendance', label: 'Attendance', icon: ICON.attendance })
  if (!tabHidden('skillset'))   items.push({ to: '/skillset',   label: 'Skill Set',  icon: ICON.skillset })
  return items
})

const adminNav = computed(() => {
  const items = []
  if (!tabHidden('designers')) items.push({ to: '/designers', label: 'Designers', icon: ICON.designers })
  if (!tabHidden('teams'))     items.push({ to: '/teams',     label: 'Teams',     icon: ICON.teams })
  if (!tabHidden('users'))     items.push({ to: '/users',     label: 'User Mgmt', icon: ICON.users })
  return items
})

const desNav = [
  { to: '/home',    label: 'Home',    icon: ICON.home },
  { to: '/roadmap', label: 'Roadmap', icon: ICON.roadmap },
  { to: '/history', label: 'History', icon: ICON.history },
  { to: '/badges',  label: 'Badges',  icon: ICON.badges },
]

const bottomNav = computed(() => {
  if (store.isDesigner) return desNav
  return [
    { to: '/',           label: 'Home',    icon: ICON.dashboard },
    { to: '/attendance', label: 'Attend',  icon: ICON.attendance },
    { to: '/trainings',  label: 'Training',icon: ICON.trainings },
    { to: '/skillset',   label: 'Skills',  icon: ICON.skillset },
  ]
})

function tabHidden(id) {
  if (store.role !== 'manager') return false
  const p = { hide_teams: true, hide_skillset: false, hide_attendance: true, hide_designers: false, can_manage_users: false, ...(store.permissions || {}) }
  if (id === 'teams')      return p.hide_teams !== false
  if (id === 'skillset')   return p.hide_skillset === true
  if (id === 'users')      return !p.can_manage_users
  if (id === 'attendance') return p.hide_attendance !== false
  if (id === 'designers')  return p.hide_designers === true
  return false
}

const titles = { '/': 'Dashboard', '/trainings': 'Trainings', '/attendance': 'Attendance', '/skillset': 'Skill Set', '/designers': 'Designers', '/teams': 'Teams', '/users': 'User Mgmt', '/home': 'Home', '/roadmap': 'Roadmap', '/history': 'History', '/badges': 'Badges' }
const pageTitle = computed(() => titles[route.path] || 'PT Tracker')
const displayName = computed(() => (store.isDesigner && store.designer?.name) ? store.designer.name : store.user?.email || '')
const initials = computed(() => {
  if (store.isDesigner && store.designer?.name) return store.designer.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (store.user?.email || '').slice(0, 2).toUpperCase()
})

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  const meta = document.getElementById('meta-theme')
  if (meta) meta.content = dark ? '#1f2228' : '#f0f1f4'
  localStorage.setItem('pt-th', dark ? 'dark' : 'light')
}
function toggleTheme() { isDark.value = !isDark.value; applyTheme(isDark.value) }

async function signOut() {
  await db.auth.signOut()
  store.user = null
  document.body.classList.remove('authed')
  router.push('/login')
}

onMounted(async () => {
  const saved = localStorage.getItem('pt-th') || 'dark'
  isDark.value = saved === 'dark'
  applyTheme(isDark.value)

  db.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) { await store.setUser(null); router.push('/login') }
  })

  const { data: { session } } = await db.auth.getSession()
  if (session?.user) {
    await store.setUser(session.user)
    await store.loadAll()
    document.body.classList.add('authed')
    router.push(store.isDesigner ? '/home' : '/')
  } else {
    router.push('/login')
  }
  booting.value = false
})
</script>

<style>
.toast-enter-active, .toast-leave-active { transition: all .18s ease }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px) }
</style>
