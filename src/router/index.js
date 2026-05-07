import { createRouter, createWebHashHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'

// Lazy-load each page so the initial bundle stays small.
// Each page only loads when the user navigates there.
const routes = [
  { path: '/login',      name: 'login',      component: () => import('@/views/LoginView.vue'),      meta: { public: true } },

  // ── Staff routes (trainer / manager) ──────────────────────────────────
  { path: '/',           name: 'dashboard',  component: () => import('@/views/DashboardView.vue'),  meta: { auth: true } },
  { path: '/trainings',  name: 'trainings',  component: () => import('@/views/TrainingsView.vue'),  meta: { auth: true } },
  { path: '/attendance', name: 'attendance', component: () => import('@/views/AttendanceView.vue'), meta: { auth: true } },
  { path: '/skillset',   name: 'skillset',   component: () => import('@/views/SkillSetView.vue'),   meta: { auth: true } },
  { path: '/designers',  name: 'designers',  component: () => import('@/views/DesignersView.vue'),  meta: { auth: true } },
  { path: '/teams',      name: 'teams',      component: () => import('@/views/TeamsView.vue'),       meta: { auth: true } },
  { path: '/users',      name: 'users',      component: () => import('@/views/UsersView.vue'),       meta: { auth: true } },

  // ── Designer routes ────────────────────────────────────────────────────
  { path: '/home',       name: 'des-home',     component: () => import('@/views/DesignerHomeView.vue'),    meta: { auth: true, designer: true } },
  { path: '/roadmap',    name: 'des-roadmap',  component: () => import('@/views/DesignerRoadmapView.vue'), meta: { auth: true, designer: true } },
  { path: '/history',    name: 'des-history',  component: () => import('@/views/DesignerHistoryView.vue'), meta: { auth: true, designer: true } },
  { path: '/badges',     name: 'des-badges',   component: () => import('@/views/DesignerBadgesView.vue'),  meta: { auth: true, designer: true } },

  // catch-all → dashboard
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(), // hash mode works without a server (same as the HTML file)
  routes,
})

// Navigation guard — redirect to /login if not authenticated
// Redirect designers to their home if they try to access staff routes
router.beforeEach((to) => {
  const store = useAppStore()

  if (to.meta.auth && !store.user) return { name: 'login' }
  if (to.meta.public && store.user) {
    // Send designers to their own home, staff to dashboard
    return store.isDesigner ? { name: 'des-home' } : { name: 'dashboard' }
  }

  // If a designer lands on a staff-only route, redirect to their home
  if (to.meta.auth && store.isDesigner && !to.meta.designer) {
    return { name: 'des-home' }
  }
})

export default router
