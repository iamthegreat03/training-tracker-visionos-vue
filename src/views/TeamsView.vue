<template>
  <div>
    <!-- Header -->
    <div class="sh">
      <div>
        <div class="sh-t">Teams</div>
        <div class="sh-s">{{ store.teams.length }} production teams · {{ store.designers.length }} designers</div>
      </div>
      <div style="display:flex;gap:8px">
        <template v-if="reshuffleMode">
          <div style="font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--a);align-self:center">
            {{ pendingCount }} PENDING CHANGE{{ pendingCount !== 1 ? 'S' : '' }}
          </div>
          <button class="btn btn-g" @click="cancelReshuffle">CANCEL</button>
          <button class="btn btn-p" :disabled="saving" @click="saveReshuffle">
            <span v-if="saving" class="spin"></span><span v-else>SAVE RESHUFFLE</span>
          </button>
        </template>
        <template v-else>
          <button v-if="store.isTrainer" class="btn btn-g" @click="startReshuffle">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            RESHUFFLE
          </button>
          <button v-if="store.isTrainer" class="btn btn-p" @click="openAddTeam">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            ADD TEAM
          </button>
        </template>
      </div>
    </div>

    <!-- Reshuffle Mode Banner -->
    <div v-if="reshuffleMode"
      style="border:1px solid var(--a);background:var(--a-bg);padding:10px 16px;margin-bottom:20px;font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--a);letter-spacing:.4px">
      ⚡ RESHUFFLE MODE — Use the dropdown on each designer to stage a team move. Changes are previewed live and saved together when you click SAVE RESHUFFLE.
    </div>

    <!-- Team Cards Grid -->
    <div class="teams-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--bdr)">
      <div v-for="(t, i) in store.teams" :key="t.id"
        style="background:var(--bg)"
        :style="{ borderLeft: `2px solid ${COLORS[i % COLORS.length]}` }">

        <!-- Team Header -->
        <div style="padding:16px 18px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:15px;font-weight:300;color:var(--t1)">{{ t.name }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:3px">
              {{ effectiveMembers(t.name).length }} MEMBERS
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="text-align:right">
              <div style="font-size:18px;font-weight:300;font-family:'JetBrains Mono',monospace"
                :style="{ color: teamRate(t.name) >= 80 ? 'var(--g)' : teamRate(t.name) >= 60 ? 'var(--a)' : 'var(--r)' }">
                {{ teamRate(t.name) }}%
              </div>
              <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">ATTENDANCE</div>
            </div>
            <button v-if="store.isTrainer && !reshuffleMode"
              class="btn btn-d btn-xs"
              @click.stop="confirmDeleteTeam(t)"
              title="Delete team">DEL</button>
          </div>
        </div>

        <!-- Tier Summary -->
        <div style="padding:10px 18px;border-bottom:1px solid var(--bdr);display:flex;gap:14px;flex-wrap:wrap">
          <template v-if="Object.keys(tierSummary(t.name)).length">
            <div v-for="(count, tier) in tierSummary(t.name)" :key="tier"
              style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--t4)">
              {{ (tier || '').toUpperCase() }} <span style="color:var(--t2);font-weight:500">{{ count }}</span>
            </div>
          </template>
          <div v-else style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--t4)">NO MEMBERS</div>
        </div>

        <!-- Roster List -->
        <div>
          <div v-if="effectiveMembers(t.name).length === 0"
            style="padding:16px 18px;font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace">
            — EMPTY —
          </div>
          <div v-for="d in effectiveMembers(t.name)" :key="d.id"
            style="padding:10px 18px;border-bottom:1px solid var(--bdr-s);display:flex;align-items:center;gap:10px;transition:background .1s"
            :style="{ background: isPending(d.id) ? 'var(--a-bg)' : '' }"
            @mouseover="e => !isPending(d.id) && (e.currentTarget.style.background = 'var(--sur-h)')"
            @mouseleave="e => (e.currentTarget.style.background = isPending(d.id) ? 'var(--a-bg)' : '')">

            <!-- Avatar -->
            <div style="width:22px;height:22px;background:var(--sur-h);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:8px;font-family:'JetBrains Mono',monospace;color:var(--t3);flex-shrink:0">
              {{ init(d.name) }}
            </div>

            <!-- Name + rank -->
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                {{ d.name }}
                <span v-if="isPending(d.id)" style="font-size:8px;color:var(--a);font-family:'JetBrains Mono',monospace">
                  → {{ reshuffleChanges[d.id] }}
                </span>
              </div>
              <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:1px">
                {{ d.rank || '—' }} · {{ getTrainingCount(d.id) }} TRAINING{{ getTrainingCount(d.id) !== 1 ? 'S' : '' }}
              </div>
            </div>

            <!-- Reshuffle dropdown OR attendance rate -->
            <template v-if="reshuffleMode">
              <select
                :value="reshuffleChanges[d.id] || d.team"
                @change="stageReshuffle(d.id, d.team, $event.target.value)"
                style="background:var(--bg);font-size:9px;padding:3px 6px;font-family:'JetBrains Mono',monospace;letter-spacing:.4px;cursor:pointer;outline:none;max-width:110px"
                :style="{ border: `1px solid ${isPending(d.id) ? 'var(--a)' : 'var(--bdr)'}`, color: isPending(d.id) ? 'var(--a)' : 'var(--t3)' }">
                <option v-for="tm in store.teams" :key="tm.name" :value="tm.name">{{ tm.name }}</option>
              </select>
            </template>
            <template v-else>
              <span v-if="getDesRate(d.id) !== null"
                style="font-size:11px;font-family:'JetBrains Mono',monospace"
                :style="{ color: getDesRate(d.id) >= 80 ? 'var(--g)' : getDesRate(d.id) >= 60 ? 'var(--a)' : 'var(--r)' }">
                {{ getDesRate(d.id) }}%
              </span>
              <span v-else style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace">—</span>
            </template>
          </div>
        </div>

        <!-- View Full Roster -->
        <div v-if="!reshuffleMode" style="padding:10px 18px;border-top:1px solid var(--bdr)">
          <button @click="openRoster(t.name)"
            style="background:none;border:none;font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:.7px;color:var(--t3);cursor:pointer;transition:color .12s;text-transform:uppercase"
            @mouseover="e => e.target.style.color='var(--t1)'"
            @mouseleave="e => e.target.style.color='var(--t3)'">
            VIEW FULL ROSTER →
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="store.teams.length === 0" class="empty" style="margin-top:40px">
      <div class="ec">— NO TEAMS —</div>
    </div>

    <!-- ── ADD TEAM MODAL ── -->
    <AppModal v-model="showAddTeam" title="ADD TEAM">
      <div class="fg">
        <label>Team Name</label>
        <input v-model="newTeamName" class="inp" placeholder="e.g. Epsilon" autofocus />
      </div>
      <template #footer>
        <button class="btn btn-g" @click="showAddTeam = false">CANCEL</button>
        <button class="btn btn-p" :disabled="saving || !newTeamName.trim()" @click="addTeam">
          <span v-if="saving" class="spin"></span><span v-else>CREATE</span>
        </button>
      </template>
    </AppModal>

    <!-- ── DELETE TEAM CONFIRM MODAL ── -->
    <AppModal v-model="showDeleteTeam" :title="`DELETE TEAM // ${deleteTarget?.name?.toUpperCase()}`">
      <div style="text-align:center;padding:8px 0">
        <div style="font-size:32px;margin-bottom:14px">⚠</div>
        <div style="font-size:14px;color:var(--t1);font-weight:500;margin-bottom:10px">
          Delete team <strong>{{ deleteTarget?.name }}</strong>?
        </div>
        <div v-if="deleteTargetMemberCount > 0" style="font-size:12px;color:var(--t3);margin-bottom:16px">
          <strong style="color:var(--a)">{{ deleteTargetMemberCount }} designer{{ deleteTargetMemberCount !== 1 ? 's' : '' }}</strong>
          will be moved to Uncategorized.
        </div>
        <div v-else style="font-size:12px;color:var(--t3);margin-bottom:16px">This team has no members.</div>
        <div style="font-size:10px;color:var(--r);font-family:'JetBrains Mono',monospace;background:var(--r-bg);border:1px solid rgba(248,113,113,.25);padding:10px 14px">
          This cannot be undone.
        </div>
      </div>
      <template #footer>
        <button class="btn btn-g" @click="showDeleteTeam = false">CANCEL</button>
        <button class="btn btn-d" :disabled="saving" @click="deleteTeam">
          <span v-if="saving" class="spin"></span>
          <span v-else>YES, DELETE TEAM</span>
        </button>
      </template>
    </AppModal>

    <!-- ── FULL ROSTER MODAL ── -->
    <AppModal v-model="showRosterModal" :title="`TEAM ROSTER // ${rosterTeam?.toUpperCase()}`" large>
      <template v-if="rosterTeam">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--bdr)">
          <div>
            <div style="font-size:18px;font-weight:300;color:var(--t1)">{{ rosterTeam }}</div>
            <div style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:3px">
              {{ rosterMembers.length }} MEMBERS
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:28px;font-weight:300;font-family:'JetBrains Mono',monospace"
              :style="{ color: rosterRate >= 80 ? 'var(--g)' : rosterRate >= 60 ? 'var(--a)' : 'var(--r)' }">
              {{ rosterRate }}%
            </div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">TEAM ATTENDANCE</div>
          </div>
        </div>

        <div class="tw">
          <table>
            <thead>
              <tr>
                <th>Designer</th>
                <th>Tier</th>
                <th>Trainings</th>
                <th style="text-align:right">Attendance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="rosterMembers.length === 0">
                <td colspan="4"><div class="empty"><div class="ec">— EMPTY TEAM —</div></div></td>
              </tr>
              <tr v-for="d in rosterMembers" :key="d.id">
                <td>
                  <div style="display:flex;align-items:center;gap:9px">
                    <div style="width:22px;height:22px;background:var(--sur-h);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:8px;font-family:'JetBrains Mono',monospace;color:var(--t3);flex-shrink:0">
                      {{ init(d.name) }}
                    </div>
                    <div>
                      <div style="font-size:13px;color:var(--t1)">{{ d.name }}</div>
                      <div v-if="d.email" style="font-size:10px;color:var(--t4)">{{ d.email }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="tag">{{ d.rank || '—' }}</span></td>
                <td>
                  <div style="display:flex;flex-wrap:wrap;gap:4px">
                    <span v-for="t in getRosterDesTrainings(d.id)" :key="t.id" class="tag" style="font-size:9px">{{ t.name }}</span>
                    <span v-if="getRosterDesTrainings(d.id).length === 0" style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace">—</span>
                  </div>
                </td>
                <td style="text-align:right">
                  <span v-if="getDesRate(d.id) !== null"
                    style="font-size:13px;font-family:'JetBrains Mono',monospace;font-weight:300"
                    :style="{ color: getDesRate(d.id) >= 80 ? 'var(--g)' : getDesRate(d.id) >= 60 ? 'var(--a)' : 'var(--r)' }">
                    {{ getDesRate(d.id) }}%
                  </span>
                  <span v-else style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-g" @click="showRosterModal = false">CLOSE</button>
      </template>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { db } from '@/lib/supabase'
import { pct, init } from '@/lib/utils'
import AppModal from '@/components/AppModal.vue'

const store = useAppStore()

const COLORS = ['var(--t1)', 'var(--g)', 'var(--bl)', 'var(--a)', 'var(--r)', 'rgba(255,255,255,.4)']

const saving = ref(false)

// ── Helpers ──────────────────────────────────────────────────────────────
function getDesRate(did) {
  const myT = store.trainings.filter(t => store.enrollments.some(e => e.training_id === t.id && e.designer_id === did))
  const mySe = store.sessions.filter(s => myT.some(t => t.id === s.training_id))
  const mk = store.attendance.filter(a => mySe.some(s => s.id === a.session_id) && a.designer_id === did && a.is_present !== null)
  return mk.length > 0 ? pct(mk.filter(a => a.is_present === true || a.is_present === 'late').length, mk.length) : null
}

function getTrainingCount(did) {
  return store.trainings.filter(t => store.enrollments.some(e => e.training_id === t.id && e.designer_id === did)).length
}

function teamRate(teamName) {
  const att = store.attendance.filter(a => {
    const d = store.designers.find(x => x.id === a.designer_id)
    return d?.team === teamName && a.is_present !== null
  })
  return pct(att.filter(a => a.is_present === true).length, att.length)
}

function tierSummary(teamName) {
  const mems = effectiveMembers(teamName)
  const result = {}
  mems.forEach(m => { result[m.rank] = (result[m.rank] || 0) + 1 })
  return result
}

// ── Reshuffle Mode ────────────────────────────────────────────────────────
const reshuffleMode = ref(false)
const reshuffleChanges = reactive({})

const pendingCount = computed(() => Object.keys(reshuffleChanges).length)

// Returns effective team for a designer (considering pending reshuffle changes)
function effectiveTeam(d) {
  return reshuffleChanges[d.id] !== undefined ? reshuffleChanges[d.id] : d.team
}

function effectiveMembers(teamName) {
  return store.designers.filter(d => effectiveTeam(d) === teamName)
}

function isPending(did) {
  return reshuffleChanges[did] !== undefined
}

function stageReshuffle(did, originalTeam, newTeam) {
  if (newTeam === originalTeam) {
    delete reshuffleChanges[did]
  } else {
    reshuffleChanges[did] = newTeam
  }
}

function startReshuffle() {
  Object.keys(reshuffleChanges).forEach(k => delete reshuffleChanges[k])
  reshuffleMode.value = true
}

function cancelReshuffle() {
  Object.keys(reshuffleChanges).forEach(k => delete reshuffleChanges[k])
  reshuffleMode.value = false
}

async function saveReshuffle() {
  const entries = Object.entries(reshuffleChanges)
  if (!entries.length) return
  saving.value = true
  for (const [did, team] of entries) {
    await db.from('designers').update({ team }).eq('id', did)
  }
  cancelReshuffle()
  await store.loadAll()
  saving.value = false
}

// ── Add Team ─────────────────────────────────────────────────────────────
const showAddTeam = ref(false)
const newTeamName = ref('')

function openAddTeam() {
  newTeamName.value = ''
  showAddTeam.value = true
}

async function addTeam() {
  if (!newTeamName.value.trim()) return
  saving.value = true
  const { error } = await db.from('teams').insert({ name: newTeamName.value.trim() })
  if (!error) { showAddTeam.value = false; await store.loadAll() }
  saving.value = false
}

// ── Delete Team ───────────────────────────────────────────────────────────
const showDeleteTeam = ref(false)
const deleteTarget = ref(null)
const deleteTargetMemberCount = computed(() =>
  deleteTarget.value ? store.designers.filter(d => d.team === deleteTarget.value.name).length : 0
)

function confirmDeleteTeam(team) {
  deleteTarget.value = team
  showDeleteTeam.value = true
}

async function deleteTeam() {
  if (!deleteTarget.value) return
  saving.value = true
  // Move members to null (Uncategorized)
  await db.from('designers').update({ team: null }).eq('team', deleteTarget.value.name)
  // Delete the team record
  const { error } = await db.from('teams').delete().eq('id', deleteTarget.value.id)
  if (!error) { showDeleteTeam.value = false; deleteTarget.value = null; await store.loadAll() }
  saving.value = false
}

// ── Full Roster Modal ─────────────────────────────────────────────────────
const showRosterModal = ref(false)
const rosterTeam = ref(null)

const rosterMembers = computed(() =>
  rosterTeam.value
    ? store.designers.filter(d => d.team === rosterTeam.value).sort((a, b) => a.name.localeCompare(b.name))
    : []
)

const rosterRate = computed(() => {
  if (!rosterTeam.value) return 0
  return teamRate(rosterTeam.value)
})

function openRoster(teamName) {
  rosterTeam.value = teamName
  showRosterModal.value = true
}

function getRosterDesTrainings(did) {
  return store.trainings.filter(t => store.enrollments.some(e => e.training_id === t.id && e.designer_id === did))
}
</script>
