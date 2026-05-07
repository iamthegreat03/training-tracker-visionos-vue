<template>
  <div>
    <!-- Header -->
    <div class="sh">
      <div>
        <div class="sh-t">User Management</div>
        <div class="sh-s">Create and manage designer accounts</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-g btn-sm" @click="loadUsers">REFRESH</button>
        <button class="btn btn-p" @click="openAddAccount">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          ADD ACCOUNT
        </button>
      </div>
    </div>

    <!-- Users Table Card -->
    <div class="card">
      <div class="c-hd">
        <span class="c-ttl">Configured Accounts</span>
        <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">{{ users.length }} accounts</span>
      </div>

      <div v-if="loadingUsers" class="empty"><div class="ec">LOADING…</div></div>

      <div v-else-if="users.length === 0" class="empty">
        <div class="ec">— NO USERS CONFIGURED —</div>
      </div>

      <div v-else class="tw">
        <table>
          <thead>
            <tr>
              <th>Auth UID</th>
              <th>Role</th>
              <th>Designer</th>
              <th>Team</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>
                <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--t3)">
                  {{ u.auth_user_id?.slice(0, 16) }}…
                </span>
              </td>
              <td>
                <span class="tag"
                  :class="u.role === 'trainer' ? 'tag-g' : u.role === 'manager' ? 'tag-a' : 'tag-b'">
                  {{ (u.role || '').toUpperCase() }}
                </span>
              </td>
              <td class="td1">{{ u.designers?.name || '—' }}</td>
              <td><span class="tag">{{ u.designers?.team || '—' }}</span></td>
              <td>
                <button v-if="u.role === 'manager'" class="btn btn-g btn-xs" @click="openPerms(u)">
                  PERMISSIONS
                </button>
              </td>
              <td>
                <button class="btn btn-d btn-xs" @click="removeUser(u.id)">REMOVE</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── ADD ACCOUNT MODAL ── -->
    <AppModal v-model="showAddAccount" title="ADD ACCOUNT" large>
      <!-- Staff Section -->
      <div style="background:var(--bg2);border:1px solid var(--bdr);padding:16px;margin-bottom:18px">
        <div style="font-size:9px;font-weight:700;color:var(--t3);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:14px">
          STAFF ACCOUNT — Manager or Trainer (not linked to a designer profile)
        </div>
        <div class="f2">
          <div class="fg">
            <label>Email</label>
            <input v-model="staffForm.email" class="inp" type="email" placeholder="manager@email.com" />
          </div>
          <div class="fg">
            <label>Temporary Password</label>
            <input v-model="staffForm.password" class="inp" type="text" placeholder="min. 8 chars" />
          </div>
        </div>
        <div class="fg">
          <label>Role</label>
          <div style="display:flex;gap:8px">
            <button class="chip" :class="{ on: staffForm.role === 'manager' }" style="flex:1" @click="staffForm.role = 'manager'">Manager</button>
            <button class="chip" :class="{ on: staffForm.role === 'trainer' }" style="flex:1" @click="staffForm.role = 'trainer'">Trainer</button>
          </div>
        </div>
        <button class="btn btn-p btn-sm" :disabled="saving || !staffForm.email || !staffForm.password || !staffForm.role" @click="createStaffAccount">
          <span v-if="saving" class="spin"></span><span v-else>CREATE STAFF ACCOUNT</span>
        </button>
      </div>

      <!-- Designer Account Section -->
      <div style="background:var(--bg2);border:1px solid var(--bdr);padding:16px">
        <div style="font-size:9px;font-weight:700;color:var(--t3);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:14px">
          DESIGNER ACCOUNT — Linked to an existing designer profile
        </div>
        <div class="f2">
          <div class="fg">
            <label>Email</label>
            <input v-model="desForm.email" class="inp" type="email" placeholder="designer@email.com" />
          </div>
          <div class="fg">
            <label>Temporary Password</label>
            <input v-model="desForm.password" class="inp" type="text" placeholder="min. 8 chars" />
          </div>
        </div>
        <div class="fg">
          <label>Link to Designer Profile</label>
          <input v-model="desSearch" class="inp" placeholder="Search designer name…" @input="filterDesigners" />
          <div v-if="desResults.length" style="border:1px solid var(--bdr);background:var(--bg);margin-top:4px;max-height:160px;overflow-y:auto">
            <div v-for="d in desResults" :key="d.id"
              style="padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--bdr-s);display:flex;justify-content:space-between;align-items:center"
              :style="{ background: desForm.designerId === d.id ? 'var(--sur-h)' : '' }"
              @click="selectDesigner(d)">
              <div>
                <div style="font-size:13px;color:var(--t1)">{{ d.name }}</div>
                <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">{{ d.team }} · {{ d.rank }}</div>
              </div>
              <span v-if="desForm.designerId === d.id" style="font-size:9px;color:var(--g);font-family:'JetBrains Mono',monospace">SELECTED ✓</span>
            </div>
          </div>
          <div v-if="desForm.selectedDesName" style="margin-top:6px;font-size:10px;color:var(--g);font-family:'JetBrains Mono',monospace">
            ✓ Linked to: {{ desForm.selectedDesName }}
          </div>
        </div>
        <button class="btn btn-p btn-sm" :disabled="saving || !desForm.email || !desForm.password || !desForm.designerId" @click="createDesAccount">
          <span v-if="saving" class="spin"></span><span v-else>CREATE DESIGNER ACCOUNT</span>
        </button>
      </div>

      <template #footer>
        <button class="btn btn-g" @click="showAddAccount = false">CLOSE</button>
      </template>
    </AppModal>

    <!-- ── PERMISSIONS MODAL ── -->
    <AppModal v-model="showPermsModal" :title="`PERMISSIONS // ${permsUser?.designers?.name?.toUpperCase() || 'MANAGER'}`">
      <div style="font-size:9px;color:var(--a);font-family:'JetBrains Mono',monospace;margin-bottom:16px;border:1px solid rgba(251,191,36,.2);background:var(--a-bg);padding:8px 12px">
        MANAGER ACCOUNT — Toggle restrictions for this manager
      </div>

      <div v-for="key in PERM_KEYS" :key="key"
        style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--bdr-s)">
        <span style="font-size:12px;color:var(--t2)">{{ PERM_LABELS[key] }}</span>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" v-model="permForm[key]" style="width:16px;height:16px;cursor:pointer" />
          <span style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--t4)">
            {{ permForm[key] ? 'ON' : 'OFF' }}
          </span>
        </label>
      </div>

      <template #footer>
        <button class="btn btn-g" @click="showPermsModal = false">CANCEL</button>
        <button class="btn btn-p" :disabled="saving" @click="savePerms">
          <span v-if="saving" class="spin"></span><span v-else>SAVE PERMISSIONS</span>
        </button>
      </template>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { db } from '@/lib/supabase'
import AppModal from '@/components/AppModal.vue'
import { useToast } from '@/composables/useToast'

const store = useAppStore()
const { toast } = useToast()

// ── Constants ────────────────────────────────────────────────────────────
const DEFAULT_MGR_PERMS = {
  can_add_designers: false,
  can_delete_designers: false,
  can_add_trainings: false,
  can_delete_trainings: false,
  can_mark_attendance: false,
  can_add_sessions: false,
  can_manage_users: false,
  hide_teams: true,
  hide_skillset: false,
  hide_attendance: true,
  hide_designers: false
}

const PERM_KEYS = Object.keys(DEFAULT_MGR_PERMS)

const PERM_LABELS = {
  can_add_designers: 'Can Add Designers',
  can_delete_designers: 'Can Delete Designers',
  can_add_trainings: 'Can Add / Edit Trainings',
  can_delete_trainings: 'Can Delete Trainings',
  can_mark_attendance: 'Can Mark Attendance',
  can_add_sessions: 'Can Add Sessions',
  can_manage_users: 'Can Manage Users',
  hide_teams: 'Hide Teams Tab',
  hide_skillset: 'Hide Skill Set Tab',
  hide_attendance: 'Hide Attendance Tab',
  hide_designers: 'Hide Designers Tab'
}

// ── Users List ────────────────────────────────────────────────────────────
const users = ref([])
const loadingUsers = ref(false)
const saving = ref(false)

async function loadUsers() {
  loadingUsers.value = true
  const { data, error } = await db.from('user_roles').select('*,designers(name,team,rank,email)')
  if (!error) users.value = data || []
  loadingUsers.value = false
}

async function removeUser(id) {
  if (!confirm('Remove this user role? They will lose access.')) return
  const { error } = await db.from('user_roles').delete().eq('id', id)
  if (error) { toast(error.message, 'er'); return }
  toast('User removed')
  await loadUsers()
}

onMounted(() => loadUsers())

// ── Add Account Modal ────────────────────────────────────────────────────
const showAddAccount = ref(false)

const staffForm = reactive({ email: '', password: 'RWDS2026!', role: 'manager' })
const desForm = reactive({ email: '', password: 'RWDS2026!', designerId: '', selectedDesName: '' })
const desSearch = ref('')
const desResults = ref([])

function openAddAccount() {
  Object.assign(staffForm, { email: '', password: 'RWDS2026!', role: 'manager' })
  Object.assign(desForm, { email: '', password: 'RWDS2026!', designerId: '', selectedDesName: '' })
  desSearch.value = ''
  desResults.value = []
  showAddAccount.value = true
}

function filterDesigners() {
  const q = desSearch.value.toLowerCase()
  if (!q) { desResults.value = []; return }
  desResults.value = store.designers.filter(d => d.name.toLowerCase().includes(q)).slice(0, 8)
}

function selectDesigner(d) {
  desForm.designerId = d.id
  desForm.selectedDesName = d.name
  desSearch.value = d.name
  desResults.value = []
}

async function createStaffAccount() {
  if (!staffForm.email || !staffForm.password || !staffForm.role) return
  saving.value = true
  try {
    // Create auth user via Supabase admin (requires service role in a server function)
    // For now, create via signUp and insert role row
    const { data: authData, error: authErr } = await db.auth.signUp({
      email: staffForm.email,
      password: staffForm.password
    })
    if (authErr) { alert(authErr.message); saving.value = false; return }
    const authUserId = authData?.user?.id
    if (!authUserId) { alert('Could not retrieve user ID'); saving.value = false; return }
    const { error: roleErr } = await db.from('user_roles').upsert(
      { auth_user_id: authUserId, role: staffForm.role, designer_id: null },
      { onConflict: 'auth_user_id' }
    )
    if (roleErr) { alert(roleErr.message); saving.value = false; return }
    alert(`Account created for ${staffForm.email} · Share password: ${staffForm.password}`)
    showAddAccount.value = false
    await loadUsers()
  } catch (e) { alert(e.message) }
  saving.value = false
}

async function createDesAccount() {
  if (!desForm.email || !desForm.password || !desForm.designerId) return
  saving.value = true
  try {
    const { data: authData, error: authErr } = await db.auth.signUp({
      email: desForm.email,
      password: desForm.password
    })
    if (authErr) { alert(authErr.message); saving.value = false; return }
    const authUserId = authData?.user?.id
    if (!authUserId) { alert('Could not retrieve user ID'); saving.value = false; return }
    const { error: roleErr } = await db.from('user_roles').upsert(
      { auth_user_id: authUserId, role: 'designer', designer_id: desForm.designerId },
      { onConflict: 'auth_user_id' }
    )
    if (roleErr) { alert(roleErr.message); saving.value = false; return }
    // Link auth_user_id back to designers table
    await db.from('designers').update({ auth_user_id: authUserId }).eq('id', desForm.designerId)
    // Set email on designer if missing
    const des = store.designers.find(d => d.id === desForm.designerId)
    if (des && !des.email) {
      await db.from('designers').update({ email: desForm.email }).eq('id', desForm.designerId)
    }
    alert(`Account created for ${des?.name || desForm.email} · Share password: ${desForm.password}`)
    showAddAccount.value = false
    await loadUsers()
    await store.loadAll()
  } catch (e) { alert(e.message) }
  saving.value = false
}

// ── Permissions Modal ────────────────────────────────────────────────────
const showPermsModal = ref(false)
const permsUser = ref(null)
const permForm = reactive({ ...DEFAULT_MGR_PERMS })

function openPerms(u) {
  permsUser.value = u
  const merged = { ...DEFAULT_MGR_PERMS, ...(u.permissions || {}) }
  Object.assign(permForm, merged)
  showPermsModal.value = true
}

async function savePerms() {
  if (!permsUser.value) return
  saving.value = true
  const permsPayload = {}
  PERM_KEYS.forEach(k => { permsPayload[k] = permForm[k] })
  const { error } = await db.from('user_roles').update({ permissions: permsPayload }).eq('id', permsUser.value.id)
  if (error) { toast(error.message, 'er'); saving.value = false; return }
  toast('Permissions saved')
  showPermsModal.value = false
  await loadUsers()
  saving.value = false
}
</script>
