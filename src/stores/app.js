import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/lib/supabase'
import { normAtt } from '@/lib/utils'

export const useAppStore = defineStore('app', () => {
  // ── Auth state ──────────────────────────────────────────────
  const user       = ref(null)   // Supabase auth user
  const role       = ref(null)   // 'manager' | 'trainer' | 'designer'
  const designer   = ref(null)   // linked designer row (if role === 'designer')
  const permissions = ref({})    // manager permission overrides

  // ── Data tables (mirrors the old S object) ──────────────────
  const designers      = ref([])
  const teams          = ref([])
  const trainings      = ref([])
  const enrollments    = ref([])
  const sessions       = ref([])
  const attendance     = ref([])
  const makeups        = ref([])
  const designerSkills = ref([])
  const users          = ref([])
  const makeupRequests = ref([])

  // ── Loading flag ────────────────────────────────────────────
  const loading = ref(false)

  // ── Permission helper ───────────────────────────────────────
  // Mirrors can() from the HTML file
  function can(key) {
    if (role.value === 'manager') {
      return permissions.value?.[key] !== false
    }
    if (role.value === 'trainer') return true
    return false
  }

  // ── loadAll — fetches everything from Supabase ───────────────
  async function loadAll() {
    loading.value = true
    const [de, te, tr, en, se, at, mk, ds] = await Promise.all([
      db.from('designers').select('*').order('name'),
      db.from('teams').select('*').order('name'),
      db.from('trainings').select('*').order('created_at', { ascending: false }),
      db.from('training_enrollments').select('*'),
      db.from('training_sessions').select('*').order('session_date'),
      db.from('attendance').select('*'),
      db.from('makeup_sessions').select('*').order('makeup_date'),
      db.from('designer_skills').select('*'),
    ])
    designers.value      = de.data || []
    teams.value          = te.data || []
    trainings.value      = tr.data || []
    enrollments.value    = en.data || []
    sessions.value       = se.data || []
    makeups.value        = mk.data || []
    designerSkills.value = ds.data || []
    attendance.value     = (at.data || []).map(a => ({ ...a, is_present: normAtt(a.is_present) }))

    // Makeup requests (table may not exist yet — safe fetch)
    try {
      const mr = await db.from('makeup_requests').select('*').order('created_at', { ascending: false })
      makeupRequests.value = mr.data || []
    } catch { makeupRequests.value = [] }

    loading.value = false
  }

  // ── setUser — called after Supabase auth ─────────────────────
  async function setUser(authUser) {
    user.value = authUser
    if (!authUser) { role.value = null; designer.value = null; return }

    const { data: roleRow } = await db
      .from('user_roles')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single()

    if (!roleRow) { role.value = null; return }

    role.value = roleRow.role
    permissions.value = roleRow.permissions || {}

    if (roleRow.role === 'designer' && roleRow.designer_id) {
      const { data: d } = await db.from('designers').select('*').eq('id', roleRow.designer_id).single()
      designer.value = d || null
    }
  }

  // ── Computed helpers used across pages ───────────────────────
  const isManager = computed(() => role.value === 'manager')
  const isTrainer = computed(() => role.value === 'trainer')
  const isDesigner = computed(() => role.value === 'designer')
  const isAdmin   = computed(() => role.value === 'manager' || role.value === 'trainer')

  return {
    // auth
    user, role, designer, permissions,
    isManager, isTrainer, isDesigner, isAdmin,
    // data
    designers, teams, trainings, enrollments, sessions,
    attendance, makeups, designerSkills, users, makeupRequests,
    // state
    loading,
    // actions
    can, loadAll, setUser,
  }
})
