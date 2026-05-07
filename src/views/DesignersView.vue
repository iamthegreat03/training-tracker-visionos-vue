<template>
  <div>
    <!-- Header -->
    <div class="sh">
      <div>
        <div class="sh-t">Designers</div>
        <div class="sh-s">{{ store.designers.length }} total · {{ teamCount }} teams</div>
      </div>
      <div style="display:flex;gap:8px">
        <template v-if="bulkMode">
          <button class="btn btn-g" @click="exitBulk">CANCEL</button>
          <button class="btn btn-p" :disabled="!selSet.size" @click="openBulkEnroll">BULK ENROLL ({{ selSet.size }})</button>
          <button class="btn btn-p" :disabled="!selSet.size" @click="openBulkTransfer">BULK TRANSFER ({{ selSet.size }})</button>
          <button class="btn btn-d" :disabled="!selSet.size" @click="doBulkDelete">BULK DELETE ({{ selSet.size }})</button>
        </template>
        <template v-else>
          <button v-if="store.can('can_add_designers')" class="btn btn-g" @click="bulkMode = true">BULK</button>
          <button v-if="store.can('can_add_designers')" class="btn btn-p" @click="openDesEdit(null)">+ ADD</button>
        </template>
      </div>
    </div>

    <!-- Quick Stats -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:1px;background:var(--bdr);border:1px solid var(--bdr);margin-bottom:16px">
      <div style="background:var(--bg);padding:10px 16px">
        <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px">AVG ATTENDANCE</div>
        <div style="font-size:18px;font-weight:300;font-family:'JetBrains Mono',monospace;margin-top:2px"
          :style="{ color: avgRate >= 80 ? 'var(--g)' : avgRate >= 60 ? 'var(--a)' : 'var(--r)' }">
          {{ avgRate }}%
        </div>
      </div>
      <div style="background:var(--bg);padding:10px 16px">
        <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px">ABSENCE STREAKS</div>
        <div style="font-size:18px;font-weight:300;font-family:'JetBrains Mono',monospace;margin-top:2px"
          :style="{ color: streakCount > 0 ? 'var(--r)' : 'var(--t1)' }">
          {{ streakCount }}
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div style="display:flex;gap:9px;margin-bottom:14px;align-items:center;flex-wrap:wrap">
      <input class="inp" v-model="search" style="max-width:210px;padding:8px 11px" placeholder="Search name, email, team…" />
      <div class="cr" style="margin:0">
        <button v-for="t in ['All', ...store.teams.map(t => t.name)]" :key="t"
          class="chip" :class="{ on: teamFilter === t }" @click="teamFilter = t">
          {{ t }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="tw">
        <table>
          <thead>
            <tr>
              <th v-if="bulkMode" style="width:36px">
                <input type="checkbox" @change="toggleAll($event)" :checked="allSelected" />
              </th>
              <th @click="setSort('name')" style="cursor:pointer;user-select:none">
                Designer <span v-if="sort.col === 'name'" style="opacity:.5;font-size:9px">{{ sort.asc ? '↑' : '↓' }}</span>
              </th>
              <th @click="setSort('team')" style="cursor:pointer;user-select:none">
                Team <span v-if="sort.col === 'team'" style="opacity:.5;font-size:9px">{{ sort.asc ? '↑' : '↓' }}</span>
              </th>
              <th @click="setSort('rank')" style="cursor:pointer;user-select:none">
                Tier <span v-if="sort.col === 'rank'" style="opacity:.5;font-size:9px">{{ sort.asc ? '↑' : '↓' }}</span>
              </th>
              <th>Trainings</th>
              <th @click="setSort('rate')" style="cursor:pointer;user-select:none">
                Attendance <span v-if="sort.col === 'rate'" style="opacity:.5;font-size:9px">{{ sort.asc ? '↑' : '↓' }}</span>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td :colspan="bulkMode ? 7 : 6">
                <div class="empty"><div class="ec">— NO RESULTS —</div></div>
              </td>
            </tr>
            <tr v-for="d in filtered" :key="d.id" style="cursor:pointer" @click="openProfile(d.id)">
              <td v-if="bulkMode" @click.stop>
                <input type="checkbox" :checked="selSet.has(d.id)" @change="toggleSel(d.id)" />
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:9px">
                  <div style="width:24px;height:24px;background:var(--sur-h);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:8px;font-family:'JetBrains Mono',monospace;color:var(--t3);flex-shrink:0">{{ init(d.name) }}</div>
                  <div>
                    <div style="font-size:13px;color:var(--t1)">{{ d.name }}</div>
                    <div v-if="d.email" style="font-size:10px;color:var(--t4)">{{ d.email }}</div>
                  </div>
                  <span v-if="isNew(d)" style="font-size:8px;font-family:'JetBrains Mono',monospace;background:var(--g-bg);color:var(--g);border:1px solid rgba(74,222,128,.3);padding:1px 5px;letter-spacing:.5px">NEW</span>
                  <span v-if="getStreak(d.id) >= 2" style="font-size:9px;color:var(--r);font-family:'JetBrains Mono',monospace">⚠ {{ getStreak(d.id) }}x absent</span>
                </div>
              </td>
              <td><span class="tag">{{ d.team || '—' }}</span></td>
              <td><span class="tag">{{ d.rank || '—' }}</span></td>
              <td>
                <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--t2)">
                  {{ getActiveTrainings(d.id) }}
                  <span style="color:var(--t4)">/ {{ getTotalTrainings(d.id) }}</span>
                </span>
              </td>
              <td>
                <span v-if="getDesRate(d.id) !== null"
                  style="font-size:12px;font-family:'JetBrains Mono',monospace;font-weight:500"
                  :style="{ color: getDesRate(d.id) >= 80 ? 'var(--g)' : getDesRate(d.id) >= 60 ? 'var(--a)' : 'var(--r)' }">
                  {{ getDesRate(d.id) }}%
                </span>
                <span v-else style="font-size:11px;color:var(--t4);font-family:'JetBrains Mono',monospace">—</span>
              </td>
              <td @click.stop>
                <div style="display:flex;gap:4px;justify-content:flex-end">
                  <button v-if="store.can('can_add_designers')" class="btn btn-ic btn-sm" @click="openDesEdit(d.id)" title="Edit">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                  </button>
                  <button v-if="store.can('can_add_designers')" class="btn btn-ic btn-sm" @click="openXfer(d.id)" title="Transfer">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  </button>
                  <button v-if="store.can('can_delete_designers')" class="btn btn-d btn-ic btn-sm" @click="deleteDes(d.id)" title="Delete">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── ADD / EDIT DESIGNER MODAL ── -->
    <AppModal v-model="showEdit" :title="editForm.id ? 'EDIT DESIGNER' : 'ADD DESIGNER'">
      <div class="f2">
        <div class="fg">
          <label>Full Name</label>
          <input v-model="editForm.name" class="inp" placeholder="e.g. Jamaica Daig" />
        </div>
        <div class="fg">
          <label>Email</label>
          <input v-model="editForm.email" class="inp" type="email" placeholder="designer@email.com" />
        </div>
      </div>
      <div class="f2">
        <div class="fg">
          <label>Team</label>
          <select v-model="editForm.team" class="sel">
            <option value="">Select…</option>
            <option v-for="t in store.teams" :key="t.name" :value="t.name">{{ t.name }}</option>
          </select>
        </div>
        <div class="fg">
          <label>Tier</label>
          <select v-model="editForm.rank" class="sel">
            <option v-for="r in TIERS" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-g" @click="showEdit = false">CANCEL</button>
        <button class="btn btn-p" :disabled="saving" @click="saveDes">
          <span v-if="saving" class="spin"></span><span v-else>SAVE</span>
        </button>
      </template>
    </AppModal>

    <!-- ── TRANSFER MODAL ── -->
    <AppModal v-model="showXfer" :title="`TRANSFER // ${xferDes?.name?.toUpperCase()}`">
      <div style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:14px">
        Current team: <strong style="color:var(--t2)">{{ xferDes?.team || '—' }}</strong>
      </div>
      <div class="fg">
        <label>Destination Team</label>
        <select v-model="xferTeam" class="sel">
          <option value="">Select…</option>
          <option v-for="t in store.teams" :key="t.name" :value="t.name" :disabled="t.name === xferDes?.team">{{ t.name }}</option>
        </select>
      </div>
      <template #footer>
        <button class="btn btn-g" @click="showXfer = false">CANCEL</button>
        <button class="btn btn-p" :disabled="saving || !xferTeam" @click="doXfer">
          <span v-if="saving" class="spin"></span><span v-else>TRANSFER</span>
        </button>
      </template>
    </AppModal>

    <!-- ── BULK ENROLL MODAL ── -->
    <AppModal v-model="showBulkEnroll" title="BULK ENROLL">
      <div class="fg">
        <label>Select Training</label>
        <select v-model="bulkEnrollTid" class="sel">
          <option value="">Select…</option>
          <option v-for="t in activeTrainings" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </div>
      <div style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace">{{ selSet.size }} designers will be enrolled</div>
      <template #footer>
        <button class="btn btn-g" @click="showBulkEnroll = false">CANCEL</button>
        <button class="btn btn-p" :disabled="saving || !bulkEnrollTid" @click="doBulkEnroll">
          <span v-if="saving" class="spin"></span><span v-else>ENROLL ALL</span>
        </button>
      </template>
    </AppModal>

    <!-- ── BULK TRANSFER MODAL ── -->
    <AppModal v-model="showBulkTransfer" title="BULK TRANSFER">
      <div class="fg">
        <label>Destination Team</label>
        <select v-model="bulkXferTeam" class="sel">
          <option value="">Select…</option>
          <option v-for="t in store.teams" :key="t.name" :value="t.name">{{ t.name }}</option>
        </select>
      </div>
      <div style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace">{{ selSet.size }} designers will be moved</div>
      <template #footer>
        <button class="btn btn-g" @click="showBulkTransfer = false">CANCEL</button>
        <button class="btn btn-p" :disabled="saving || !bulkXferTeam" @click="doBulkTransfer">
          <span v-if="saving" class="spin"></span><span v-else>TRANSFER ALL</span>
        </button>
      </template>
    </AppModal>

    <!-- ── DESIGNER PROFILE MODAL ── -->
    <AppModal v-model="showProfile" :title="`PROFILE // ${profDes?.name?.toUpperCase()}`" large>
      <template v-if="profDes">
        <!-- Profile Header -->
        <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:20px;padding-bottom:18px;border-bottom:1px solid var(--bdr)">
          <div style="width:48px;height:48px;background:var(--sur-h);border:1px solid var(--bdr-h);display:flex;align-items:center;justify-content:center;font-size:16px;font-family:'JetBrains Mono',monospace;color:var(--t2);flex-shrink:0">
            {{ init(profDes.name) }}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:22px;font-weight:300;color:var(--t1);margin-bottom:5px">{{ profDes.name }}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span class="tag">{{ (profDes.rank || '—').toUpperCase() }}</span>
              <span class="tag">TEAM {{ (profDes.team || '—').toUpperCase() }}</span>
              <span v-if="profDes.email" style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace;align-self:center">{{ profDes.email }}</span>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:36px;font-weight:300;font-family:'JetBrains Mono',monospace"
              :style="{ color: profRate >= 80 ? 'var(--g)' : profRate >= 60 ? 'var(--a)' : 'var(--r)' }">
              {{ profRate !== null ? profRate + '%' : '—' }}
            </div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">OVERALL RATE</div>
          </div>
        </div>

        <!-- Stats row -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(100px, 1fr));gap:1px;background:var(--bdr);border:1px solid var(--bdr);margin-bottom:20px">
          <div style="background:var(--bg);padding:12px 14px">
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.6px">TRAININGS</div>
            <div style="font-size:20px;font-weight:300;font-family:'JetBrains Mono',monospace;color:var(--t1);margin-top:3px">{{ profTrainings.length }}</div>
          </div>
          <div style="background:var(--bg);padding:12px 14px">
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.6px">SESSIONS</div>
            <div style="font-size:20px;font-weight:300;font-family:'JetBrains Mono',monospace;color:var(--t1);margin-top:3px">{{ profAttended.length }}</div>
          </div>
          <div style="background:var(--bg);padding:12px 14px">
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.6px">ABSENCES</div>
            <div style="font-size:20px;font-weight:300;font-family:'JetBrains Mono',monospace;margin-top:3px"
              :style="{ color: profAbsences.length > 3 ? 'var(--r)' : 'var(--t1)' }">
              {{ profAbsences.length }}
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div v-if="profSkills.length" style="margin-bottom:20px">
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:10px">SKILLS</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <div v-for="sk in profSkills" :key="sk.platform"
              style="font-size:10px;font-family:'JetBrains Mono',monospace;padding:4px 10px;border:1px solid var(--bdr)"
              :style="{ color: sk.level === 'Expert' ? 'var(--g)' : sk.level === 'Advanced' ? 'var(--a)' : 'var(--bl)', borderColor: sk.level === 'Expert' ? 'rgba(74,222,128,.3)' : sk.level === 'Advanced' ? 'rgba(251,191,36,.3)' : 'rgba(96,165,250,.3)', background: sk.level === 'Expert' ? 'var(--g-bg)' : sk.level === 'Advanced' ? 'var(--a-bg)' : 'rgba(96,165,250,.08)' }">
              {{ sk.platform.toUpperCase() }} · {{ sk.level.slice(0,3).toUpperCase() }}
            </div>
          </div>
        </div>

        <!-- Training history -->
        <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:10px">TRAINING HISTORY</div>
        <div v-if="profTrainings.length === 0" class="empty" style="margin-bottom:16px"><div class="ec">NO TRAININGS</div></div>
        <div v-for="t in profTrainings" :key="t.id" style="border:1px solid var(--bdr);margin-bottom:10px">
          <div style="padding:10px 14px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;background:var(--sur)">
            <div>
              <div style="font-size:13px;color:var(--t1)">{{ t.name }}</div>
              <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:2px">
                <span class="tag">{{ t.type }}</span>
                <span class="tag" style="margin-left:4px">{{ t.status }}</span>
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:16px;font-weight:300;font-family:'JetBrains Mono',monospace"
                :style="{ color: getProfTrainingRate(t.id) >= 80 ? 'var(--g)' : getProfTrainingRate(t.id) >= 60 ? 'var(--a)' : 'var(--r)' }">
                {{ getProfTrainingRate(t.id) }}%
              </div>
              <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">ATTENDANCE</div>
            </div>
          </div>
          <!-- Heatmap -->
          <div style="padding:10px 14px;display:flex;flex-wrap:wrap;gap:3px">
            <div v-for="s in getTrainingSessions(t.id)" :key="s.id"
              style="width:14px;height:14px;border:1px solid var(--bdr-s);flex-shrink:0;cursor:default"
              :style="{ background: getSessionBg(s.id) }"
              :title="`${fmtDs(s.session_date)} — ${getSessionLabel(s.id)}`">
            </div>
            <div v-if="getTrainingSessions(t.id).length === 0" style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">No sessions yet</div>
          </div>
        </div>
      </template>

      <template #footer>
        <button class="btn btn-g" @click="showProfile = false">CLOSE</button>
      </template>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { db } from '@/lib/supabase'
import { pct, init, fmtDs, TIERS } from '@/lib/utils'
import AppModal from '@/components/AppModal.vue'
import { useToast } from '@/composables/useToast'

const store = useAppStore()
const { toast } = useToast()

// ── Filters & Sort ──────────────────────────────────────────────────────
const search = ref('')
const teamFilter = ref('All')
const sort = reactive({ col: 'name', asc: true })

function setSort(col) {
  if (sort.col === col) sort.asc = !sort.asc
  else { sort.col = col; sort.asc = true }
}

// ── Helpers ─────────────────────────────────────────────────────────────
const teamCount = computed(() => new Set(store.designers.map(d => d.team)).size)

const isNew = d => d.created_at && new Date(d.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

function getDesRate(did) {
  const myT = store.trainings.filter(t => store.enrollments.some(e => e.training_id === t.id && e.designer_id === did))
  const mySe = store.sessions.filter(s => myT.some(t => t.id === s.training_id))
  const mk = store.attendance.filter(a => mySe.some(s => s.id === a.session_id) && a.designer_id === did && a.is_present !== null)
  return mk.length > 0 ? pct(mk.filter(a => a.is_present === true || a.is_present === 'late').length, mk.length) : null
}

function getStreak(did) {
  const sorted = [...store.sessions].sort((a, b) => new Date(b.session_date) - new Date(a.session_date))
  let c = 0
  for (const s of sorted) {
    const a = store.attendance.find(x => x.session_id === s.id && x.designer_id === did)
    if (!a || a.is_present === null) break
    if (a.is_present === false) c++
    else break
  }
  return c
}

function getActiveTrainings(did) {
  return store.trainings.filter(t => t.status === 'active' && store.enrollments.some(e => e.training_id === t.id && e.designer_id === did)).length
}

function getTotalTrainings(did) {
  return store.trainings.filter(t => store.enrollments.some(e => e.training_id === t.id && e.designer_id === did)).length
}

// ── Stats ────────────────────────────────────────────────────────────────
const avgRate = computed(() => {
  const rates = store.designers.map(d => getDesRate(d.id)).filter(r => r !== null)
  return rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0
})

const streakCount = computed(() => store.designers.filter(d => getStreak(d.id) >= 2).length)

// ── Filtered + Sorted list ───────────────────────────────────────────────
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let list = store.designers.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(q) || (d.email || '').toLowerCase().includes(q) || (d.team || '').toLowerCase().includes(q)
    const matchTeam = teamFilter.value === 'All' || d.team === teamFilter.value
    return matchSearch && matchTeam
  })

  return [...list].sort((a, b) => {
    let va, vb
    if (sort.col === 'name') { va = a.name; vb = b.name }
    else if (sort.col === 'team') { va = a.team || ''; vb = b.team || '' }
    else if (sort.col === 'rank') { va = a.rank || ''; vb = b.rank || '' }
    else if (sort.col === 'rate') { va = getDesRate(a.id) ?? -1; vb = getDesRate(b.id) ?? -1 }
    if (typeof va === 'string') return sort.asc ? va.localeCompare(vb) : vb.localeCompare(va)
    return sort.asc ? va - vb : vb - va
  })
})

// ── Bulk Mode ────────────────────────────────────────────────────────────
const bulkMode = ref(false)
const selSet = ref(new Set())
const saving = ref(false)

const allSelected = computed(() => filtered.value.length > 0 && filtered.value.every(d => selSet.value.has(d.id)))

function toggleSel(id) {
  const s = new Set(selSet.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selSet.value = s
}

function toggleAll(e) {
  if (e.target.checked) {
    selSet.value = new Set(filtered.value.map(d => d.id))
  } else {
    selSet.value = new Set()
  }
}

function exitBulk() {
  bulkMode.value = false
  selSet.value = new Set()
}

// ── Add / Edit Designer ──────────────────────────────────────────────────
const showEdit = ref(false)
const editForm = reactive({ id: '', name: '', email: '', team: '', rank: 'Tier 1' })

function openDesEdit(id) {
  if (id) {
    const d = store.designers.find(x => x.id === id)
    if (!d) return
    Object.assign(editForm, { id: d.id, name: d.name, email: d.email || '', team: d.team || '', rank: d.rank || 'Tier 1' })
  } else {
    Object.assign(editForm, { id: '', name: '', email: '', team: '', rank: 'Tier 1' })
  }
  showEdit.value = true
}

async function saveDes() {
  if (!editForm.name.trim() || !editForm.team) return
  saving.value = true
  const payload = { name: editForm.name.trim(), email: editForm.email.trim() || null, team: editForm.team, rank: editForm.rank }
  const { error } = editForm.id
    ? await db.from('designers').update(payload).eq('id', editForm.id)
    : await db.from('designers').insert(payload)
  if (error) { toast(error.message, 'er'); saving.value = false; return }
  toast(editForm.id ? 'Designer updated' : 'Designer added')
  showEdit.value = false
  await store.loadAll()
  saving.value = false
}

async function deleteDes(id) {
  if (!confirm('Delete this designer? This cannot be undone.')) return
  const { error } = await db.from('designers').delete().eq('id', id)
  if (error) { toast(error.message, 'er'); return }
  toast('Designer deleted')
  await store.loadAll()
}

// ── Transfer ─────────────────────────────────────────────────────────────
const showXfer = ref(false)
const xferDes = ref(null)
const xferTeam = ref('')

function openXfer(id) {
  xferDes.value = store.designers.find(d => d.id === id) || null
  xferTeam.value = ''
  showXfer.value = true
}

async function doXfer() {
  if (!xferTeam.value) return
  saving.value = true
  const { error } = await db.from('designers').update({ team: xferTeam.value }).eq('id', xferDes.value.id)
  if (error) { toast(error.message, 'er'); saving.value = false; return }
  toast(`${xferDes.value.name} transferred to ${xferTeam.value}`)
  showXfer.value = false
  await store.loadAll()
  saving.value = false
}

// ── Bulk Enroll ──────────────────────────────────────────────────────────
const showBulkEnroll = ref(false)
const bulkEnrollTid = ref('')
const activeTrainings = computed(() => store.trainings.filter(t => t.status !== 'completed'))

function openBulkEnroll() { bulkEnrollTid.value = ''; showBulkEnroll.value = true }

async function doBulkEnroll() {
  if (!bulkEnrollTid.value) return
  saving.value = true
  const rows = [...selSet.value].map(did => ({ training_id: bulkEnrollTid.value, designer_id: did, designer_schedule: [] }))
  const { error } = await db.from('training_enrollments').upsert(rows, { onConflict: 'training_id,designer_id' })
  if (error) { toast(error.message, 'er'); saving.value = false; return }
  toast(`${selSet.value.size} designer${selSet.value.size !== 1 ? 's' : ''} enrolled`)
  showBulkEnroll.value = false
  exitBulk()
  await store.loadAll()
  saving.value = false
}

// ── Bulk Transfer ────────────────────────────────────────────────────────
const showBulkTransfer = ref(false)
const bulkXferTeam = ref('')

function openBulkTransfer() { bulkXferTeam.value = ''; showBulkTransfer.value = true }

async function doBulkTransfer() {
  if (!bulkXferTeam.value) return
  saving.value = true
  for (const did of selSet.value) {
    await db.from('designers').update({ team: bulkXferTeam.value }).eq('id', did)
  }
  toast(`${selSet.value.size} designer${selSet.value.size !== 1 ? 's' : ''} transferred to ${bulkXferTeam.value}`)
  showBulkTransfer.value = false
  exitBulk()
  await store.loadAll()
  saving.value = false
}

// ── Bulk Delete ──────────────────────────────────────────────────────────
async function doBulkDelete() {
  if (!selSet.value.size) return
  if (!confirm(`Delete ${selSet.value.size} designers? This cannot be undone.`)) return
  saving.value = true
  for (const did of selSet.value) {
    await db.from('designers').delete().eq('id', did)
  }
  toast(`${selSet.value.size} designer${selSet.value.size !== 1 ? 's' : ''} deleted`)
  exitBulk()
  await store.loadAll()
  saving.value = false
}

// ── Designer Profile ─────────────────────────────────────────────────────
const showProfile = ref(false)
const profDesId = ref(null)

const profDes = computed(() => store.designers.find(d => d.id === profDesId.value) || null)
const profTrainings = computed(() => {
  if (!profDes.value) return []
  return store.trainings.filter(t => store.enrollments.some(e => e.training_id === t.id && e.designer_id === profDes.value.id))
})
const profSessions = computed(() => {
  if (!profDes.value) return []
  return store.sessions.filter(s => profTrainings.value.some(t => t.id === s.training_id))
})
const profAllAtt = computed(() => {
  if (!profDes.value) return []
  return store.attendance.filter(a => profSessions.value.some(s => s.id === a.session_id) && a.designer_id === profDes.value.id && a.is_present !== null)
})
const profAttended = computed(() => profAllAtt.value.filter(a => a.is_present === true || a.is_present === 'late'))
const profAbsences = computed(() => profAllAtt.value.filter(a => a.is_present === false))
const profRate = computed(() => profAllAtt.value.length > 0 ? pct(profAttended.value.length, profAllAtt.value.length) : null)
const profSkills = computed(() => {
  if (!profDes.value) return []
  return store.designerSkills.filter(s => s.designer_id === profDes.value.id)
})

function openProfile(id) {
  profDesId.value = id
  showProfile.value = true
}

function getTrainingSessions(tid) {
  return store.sessions.filter(s => s.training_id === tid).sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
}

function getProfTrainingRate(tid) {
  if (!profDes.value) return 0
  const tS = store.sessions.filter(s => s.training_id === tid)
  const mk = store.attendance.filter(a => tS.some(s => s.id === a.session_id) && a.designer_id === profDes.value.id && a.is_present !== null)
  const pr = mk.filter(a => a.is_present === true || a.is_present === 'late').length
  return pct(pr, mk.length)
}

function getSessionBg(sid) {
  if (!profDes.value) return 'transparent'
  const mu = store.makeups.find(m => m.original_session_id === sid && m.designer_id === profDes.value.id)
  const a = store.attendance.find(x => x.session_id === sid && x.designer_id === profDes.value.id)
  if (mu?.is_attended === true) return 'var(--g-bg)'
  if (mu?.is_attended === null) return 'rgba(96,165,250,.15)'
  if (a?.is_present === true) return 'var(--g-bg)'
  if (a?.is_present === 'late') return 'var(--a-bg)'
  if (a?.is_present === false) return 'var(--r-bg)'
  return 'transparent'
}

function getSessionLabel(sid) {
  if (!profDes.value) return 'UNMARKED'
  const mu = store.makeups.find(m => m.original_session_id === sid && m.designer_id === profDes.value.id)
  const a = store.attendance.find(x => x.session_id === sid && x.designer_id === profDes.value.id)
  if (mu?.is_attended === true) return 'MADE UP'
  if (mu?.is_attended === null) return 'MU PENDING'
  if (a?.is_present === true) return 'PRESENT'
  if (a?.is_present === 'late') return 'LATE'
  if (a?.is_present === false) return 'ABSENT'
  return 'UNMARKED'
}
</script>
