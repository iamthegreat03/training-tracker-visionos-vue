<template>
  <div class="attendance-view">
    <div class="sh">
      <div>
        <div class="sh-t">Attendance</div>
        <div class="sh-s">Track session presence</div>
      </div>
    </div>

    <!-- Select Training -->
    <div class="card" style="margin-bottom:14px">
      <div class="c-hd"><span class="c-ttl">Select Training</span></div>
      <div style="padding:12px 16px;display:flex;gap:6px;flex-wrap:wrap">
        <button 
          v-for="t in store.trainings" 
          :key="t.id"
          class="chip" 
          :class="{ on: selT === t.id }"
          @click="selectTraining(t.id)">
          {{ t.name.toUpperCase() }}
        </button>
      </div>
    </div>

    <template v-if="training">
      <!-- Sessions List -->
      <div class="card" style="margin-bottom:14px">
        <div class="c-hd">
          <span class="c-ttl">Sessions</span>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <div v-if="stats" style="display:flex;gap:14px;font-size:10px;font-family:'JetBrains Mono',monospace">
              <span style="color:var(--g)">✓ {{ stats.present }}</span>
              <span style="color:var(--a)">~ {{ stats.late }}</span>
              <span style="color:var(--r)">✗ {{ stats.absent }}</span>
              <span style="color:var(--t4)">— {{ stats.unmarked }}</span>
              <span style="color:var(--t2)">{{ pct(stats.present + stats.late, enrolled.length) }}% rate</span>
            </div>
            <div style="display:flex;gap:6px">
              <button v-if="store.can('can_mark_attendance')" class="btn btn-p btn-sm" @click="markAll(true)">ALL PRESENT</button>
              <button v-if="store.can('can_mark_attendance')" class="btn btn-g btn-sm" @click="markAll(false)">ALL ABSENT</button>
              <button v-if="store.can('can_add_sessions')" class="btn btn-g btn-sm" @click="showAddSess = true">+ SESSION</button>
              <button class="btn btn-g btn-sm" @click="exportCSV">EXPORT CSV</button>
            </div>
          </div>
        </div>
        <div class="sess-grid" style="padding:10px 16px;display:grid;gap:4px">
          <button 
            v-for="s in tSess" 
            :key="s.id"
            class="sp"
            :class="{ on: selS === s.id }"
            :style="s.session_date > TODAY ? 'opacity:.38;cursor:not-allowed;pointer-events:none;text-align:center' : 'text-align:center'"
            :title="s.session_date > TODAY ? 'Future session — not yet available' : ''"
            @click="selS = s.id">
            {{ fmtDs(s.session_date).toUpperCase() }}
          </button>
          <span v-if="tSess.length === 0" style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace;grid-column:1/-1">NO SESSIONS — CLICK + SESSION</span>
        </div>
      </div>

      <!-- Selected Session Details -->
      <div v-if="session" class="card">
        <div style="padding:12px 18px;border-bottom:1px solid var(--bdr);display:flex;flex-direction:column;gap:10px">
          <div style="flex:1;min-width:200px">
            <span class="c-ttl">{{ new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase() }}</span>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:3px">CLICK ○ → ✓ PRESENT → ~ LATE → ✗ ABSENT → ○ CLEAR</div>
          </div>
          <!-- Proof URL inline input -->
          <div style="display:flex;align-items:center;justify-content:center;gap:7px;flex:1">
            <input v-if="store.can('can_add_sessions')" class="inp" style="width:200px;padding:5px 9px;font-size:11px" placeholder="Paste screenshot / video link…" :value="session.proof_url || ''" @change="saveProofUrl(session.id, $event.target.value)" />
            <a v-if="session.proof_url" :href="session.proof_url" target="_blank" class="btn btn-g btn-sm">OPEN ↗</a>
          </div>
          <!-- Attendance filter chips -->
          <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">
            <span style="font-size:9px;color:var(--t3);font-family:'JetBrains Mono',monospace">FILTER:</span>
            <button v-for="f in ['all','present','late','absent','unmarked']" :key="f"
              class="chip btn-xs" :class="{ on: attFilter === f }"
              style="padding:3px 8px;font-size:8px"
              @click="attFilter = f">{{ f.toUpperCase() }}</button>
          </div>
        </div>
        
        <!-- Attendance Rows Grouped By Team -->
        <div v-for="team in teams" :key="team.name">
          <div style="padding:7px 18px;background:var(--bg2);border-bottom:1px solid var(--bdr);border-top:1px solid var(--bdr);font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:.8px;color:var(--t4)">TEAM {{ team.name.toUpperCase() }}</div>
          <div style="padding:10px 12px;display:flex;flex-direction:column;gap:10px">
            <div v-for="d in team.members" :key="d.id" style="border:1px solid var(--bdr);background:var(--sur);transition:border-color .15s" @mouseover="$event.currentTarget.style.borderColor='var(--bdr-h)'" @mouseout="$event.currentTarget.style.borderColor='var(--bdr)'">

              <!-- TOP ROW: name + schedule + run rate + mark buttons (right) -->
              <div style="padding:12px 14px;display:flex;align-items:flex-start;gap:10px">
                <div style="flex:1;min-width:0">
                  <div style="font-size:14px;color:var(--t1);cursor:pointer;font-weight:400;line-height:1.2" @click="openProfile(d.id)">{{ d.name }}</div>
                  <div style="font-size:10px;color:var(--t3);margin-top:4px;display:flex;gap:8px;align-items:center">
                    <span>· {{ getScheduleStr(d.id) }}</span>
                    <span v-if="getRunRate(d.id) !== null" style="color:var(--g);font-family:'JetBrains Mono',monospace">{{ getRunRate(d.id) }}%</span>
                  </div>

                </div>

                <!-- Mark buttons (always visible, top-right) -->
                <div style="display:flex;align-items:center;gap:4px;flex-shrink:0">
                  <template v-if="isScheduled(d.id) && store.can('can_mark_attendance')">
                    <button class="ac" :class="[attClass(getAtt(d.id)?.is_present), { p: isMuAttended(d.id) }]" @click="toggleAtt(session.id, d.id)">
                      {{ isMuAttended(d.id) ? '✓' : attLabel(getAtt(d.id)?.is_present) }}
                    </button>
                    <button class="ac" :style="{ borderColor: getAtt(d.id)?.notes ? 'var(--a)' : 'var(--bdr)', color: getAtt(d.id)?.notes ? 'var(--a)' : 'var(--t3)', fontSize:'13px' }" :title="getAtt(d.id)?.notes || 'Add note'" @click="openNote(session.id, d.id)">✎</button>
                    <button v-if="(getAtt(d.id)?.is_present === false || getAtt(d.id)?.is_present === null || !getAtt(d.id)) && !isMuPending(d.id) && !isMuAttended(d.id)" class="ac" style="border-color:var(--bl);color:var(--bl);font-size:14px" title="Schedule make-up" @click="openReschedule(session.id, d.id)">↺</button>
                    <button v-else-if="isMuPending(d.id)" class="ac" style="border-color:rgba(96,165,250,.4);color:var(--bl);font-size:8px;font-family:'JetBrains Mono',monospace" title="Make-up" @click="openMuStatus(d.id)">MU</button>
                  </template>
                  <span v-else style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;padding:0 4px">N/A</span>
                </div>
              </div>

              <!-- BOTTOM ROW: heatmap full width -->
              <div style="padding:6px 14px 12px;display:flex;flex-wrap:wrap;gap:3px;border-top:1px solid var(--bdr-s);background:var(--bg2)">
                <div v-for="h in getHeatmap(d.id)" :key="h.s.id" class="hm-cell" :data-s="h.state" :style="h.extraStyle">
                  <div class="hm-tip">{{ fmtDs(h.s.session_date) }} — {{ h.tip }}</div>
                </div>
                <div v-if="getHeatmap(d.id).length" style="width:100%;font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:5px">
                  {{ getHeatmap(d.id).filter(h => h.state === 'p' || h.state === 'l').length }} attended of {{ getHeatmap(d.id).filter(h => h.state && h.state !== 'x').length }} marked sessions<span v-if="getAtt(d.id)?.notes" style="color:var(--a)"> · Note: {{ getAtt(d.id).notes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>

  <!-- Add Session Modal -->
  <AppModal v-model="showAddSess" title="ADD SESSION">
     <div class="fg">
        <label>Date</label>
        <input v-model="newSessDate" type="date" class="inp" :max="TODAY" />
     </div>
     <template #footer>
        <button class="btn btn-g" @click="showAddSess = false">CANCEL</button>
        <button class="btn btn-p" :disabled="saving" @click="addSession">
           <span v-if="saving" class="spin"></span><span v-else>SAVE</span>
        </button>
     </template>
  </AppModal>

  <!-- Delete Session Modal -->
  <AppModal v-model="confirmDelSess" title="DELETE SESSION">
     <div class="al-e">Are you sure? This deletes all attendance records for this session.</div>
     <template #footer>
        <button class="btn btn-g" @click="confirmDelSess = false">CANCEL</button>
        <button class="btn btn-d" :disabled="saving" @click="delSession">DELETE</button>
     </template>
  </AppModal>

  <!-- Attendance Note Modal -->
  <AppModal v-model="showNote" title="ATTENDANCE NOTE">
     <div class="fg">
        <label>Note</label>
        <textarea v-model="noteText" class="inp" rows="3" placeholder="Excused absence, connection issues..."></textarea>
     </div>
     <template #footer>
        <button class="btn btn-g" @click="showNote = false">CANCEL</button>
        <button class="btn btn-p" :disabled="saving" @click="saveNote">SAVE</button>
     </template>
  </AppModal>

  <!-- Reschedule Modal -->
  <AppModal v-model="showReschedule" title="SCHEDULE MAKE-UP">
     <div class="fg">
        <label>Make-up Date</label>
        <input v-model="muDate" type="date" class="inp" :min="session?.session_date" />
     </div>
     <template #footer>
        <button class="btn btn-g" @click="showReschedule = false">CANCEL</button>
        <button class="btn btn-p" :disabled="saving" @click="saveReschedule">SCHEDULE</button>
     </template>
  </AppModal>

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { db } from '@/lib/supabase'
import { fmtDs, pct, TODAY, normAtt, cycleAtt, attClass, attLabel } from '@/lib/utils'
import AppModal from '@/components/AppModal.vue'
import { useToast } from '@/composables/useToast'

const store = useAppStore()
const { toast } = useToast()

const selT = ref(null)
const selS = ref(null)
const attFilter = ref('all')

const training = computed(() => store.trainings.find(t => t.id === selT.value))
const tSess = computed(() => store.sessions.filter(s => s.training_id === selT.value).sort((a,b) => new Date(a.session_date) - new Date(b.session_date)))
const session = computed(() => tSess.value.find(s => s.id === selS.value))

const enrolled = computed(() => store.enrollments.filter(e => e.training_id === selT.value))

const stats = computed(() => {
  if (!session.value) return null
  const atts = store.attendance.filter(a => a.session_id === selS.value)
  const scheduled = enrolled.value.filter(e => isScheduledDes(e.designer_id))
  let present=0, late=0, absent=0, unmarked=0
  for(const e of scheduled) {
     const a = atts.find(x => x.designer_id === e.designer_id)
     const m = store.makeups.find(x => x.original_session_id === selS.value && x.designer_id === e.designer_id)
     if (m?.is_attended === true) present++
     else if (!a || a.is_present === null) unmarked++
     else if (a.is_present === true) present++
     else if (a.is_present === 'late') late++
     else absent++
  }
  return { present, late, absent, unmarked }
})

// Filtered teams based on attFilter
const teams = computed(() => {
   if (!training.value) return []
   const desMap = new Map(store.designers.map(d => [d.id, d]))
   const filtered = enrolled.value.map(e => desMap.get(e.designer_id)).filter(Boolean).sort((a,b) => a.name.localeCompare(b.name))
   const groups = {}
   for (const d of filtered) {
      const t = d.team || 'Unassigned'
      if(!groups[t]) groups[t] = []
      groups[t].push(d)
   }
   return Object.keys(groups).sort().map(k => ({
      name: k,
      members: groups[k].filter(d => {
        if (attFilter.value === 'all') return true
        if (!session.value) return true
        const a = store.attendance.find(x => x.session_id === session.value.id && x.designer_id === d.id)
        const mu = store.makeups.find(x => x.original_session_id === session.value.id && x.designer_id === d.id)
        const val = normAtt(a?.is_present ?? null)
        if (attFilter.value === 'present') return val === true || mu?.is_attended === true
        if (attFilter.value === 'late')    return val === 'late'
        if (attFilter.value === 'absent')  return val === false
        if (attFilter.value === 'unmarked') return isScheduledDes(d.id) && val === null && !mu
        return true
      })
   })).filter(t => t.members.length > 0)
})

// Auto-selects
watch(selT, () => { selS.value = null })
onMounted(() => {
  // Restore media queries for grid since we are converting it
  // Actually we use inline grid + sess-grid class, let's keep it simple with pure Vue
  if (store.trainings.length > 0) selT.value = store.trainings[0].id
})

// Methods
function selectTraining(id) {
  selT.value = id
}

// Attendance getters
function getAtt(did) {
  if(!session.value) return null
  return store.attendance.find(a => a.session_id === session.value.id && a.designer_id === did)
}
function isScheduledDes(did) {
  if(!session.value || !training.value) return false
  const enrRow = store.enrollments.find(e => e.training_id === training.value.id && e.designer_id === did)
  const desDays = enrRow?.designer_schedule || []
  const isDisc = desDays.length > 0 && desDays[0].includes('-')
  return !desDays.length || (isDisc ? desDays.includes(session.value.session_date) : desDays.includes(session.value.day_of_week || ''))
}
function isScheduled(did) { return isScheduledDes(did) }

function isMuPending(did) {
   if(!session.value) return false
   const mu = store.makeups.find(m => m.original_session_id === session.value.id && m.designer_id === did)
   return mu && mu.is_attended === null
}
function isMuAttended(did) {
   if(!session.value) return false
   const mu = store.makeups.find(m => m.original_session_id === session.value.id && m.designer_id === did)
   return mu && mu.is_attended === true
}

function getScheduleStr(did) {
   const e = store.enrollments.find(e => e.training_id === selT.value && e.designer_id === did)
   const d = e?.designer_schedule || []
   if (!d.length) return 'ALL DAYS'
   return d.map(x => x.includes('-') ? fmtDs(x) : x.substring(0,3)).join(', ').toUpperCase()
}

function getHeatmap(did) {
  return tSess.value.map(s => {
      const a = store.attendance.find(x => x.session_id === s.id && x.designer_id === did)
      const enr = store.enrollments.find(e => e.training_id === selT.value && e.designer_id === did)
      const ds = enr?.designer_schedule || []
      const isDisc = ds.length > 0 && ds[0].includes('-')
      const isSched = !ds.length || (isDisc ? ds.includes(s.session_date) : ds.includes(s.day_of_week || ''))
      
      if (!isSched) return { s, state: 'x', tip: 'N/A' }
      let st = null, extraStyle = '', tip = 'UNMARKED'
      
      const mu = store.makeups.find(m => m.original_session_id === s.id && m.designer_id === did)
      if (mu?.is_attended === true) { st = 'p'; tip = 'MADE UP ✓' }
      else if (mu?.is_attended === null) { extraStyle = 'border-color:rgba(96,165,250,.4);background:rgba(96,165,250,.15)'; tip = 'MAKE-UP' }
      else if (a) {
         if(a.is_present === true) { st = 'p'; tip = 'PRESENT' }
         else if(a.is_present === 'late') { st = 'l'; tip = 'LATE' }
         else if(a.is_present === false) { st = 'a'; tip = 'ABSENT' }
      }
      return { s, state: st, tip, extraStyle }
  })
}

function getRunRate(did) {
   const hm = getHeatmap(did)
   const mk = hm.filter(h => h.state === 'p' || h.state === 'l' || h.state === 'a')
   const pres = hm.filter(h => h.state === 'p' || h.state === 'l')
   return mk.length > 0 ? pct(pres.length, mk.length) : null
}

// Marking logic
const saving = ref(false)

async function toggleAtt(sid, did) {
   const mu = store.makeups.find(x => x.original_session_id === sid && x.designer_id === did)
   if (mu && mu.is_attended === true) return // locked — made up, can't toggle

   const a = store.attendance.find(x => x.session_id === sid && x.designer_id === did)
   const prev = a ? normAtt(a.is_present) : null
   const nxt  = cycleAtt(prev)
   const val  = nxt === null ? null : (nxt === true ? 'true' : nxt === false ? 'false' : 'late')
   const prevVal = prev === null ? null : (prev === true ? 'true' : prev === false ? 'false' : 'late')

   // ── OPTIMISTIC: update store immediately ──────────────────
   const idx = store.attendance.findIndex(x => x.session_id === sid && x.designer_id === did)
   if (idx > -1) store.attendance[idx].is_present = val
   else store.attendance.push({ session_id: sid, designer_id: did, is_present: val })

   // ── Sync to DB in background ──────────────────────────────
   const { error } = await db.from('attendance').upsert(
     { session_id: sid, designer_id: did, is_present: val },
     { onConflict: 'session_id,designer_id' }
   )

   if (error) {
     // Rollback on DB error
     const ri = store.attendance.findIndex(x => x.session_id === sid && x.designer_id === did)
     if (ri > -1) store.attendance[ri].is_present = prevVal
     toast(error.message, 'er')
     return
   }

   // ── Refresh only this session's attendance (not full reload) ──
   const { data: fresh } = await db.from('attendance').select('*').eq('session_id', sid)
   if (fresh) {
     store.attendance = [
       ...store.attendance.filter(x => x.session_id !== sid),
       ...fresh.map(x => ({ ...x, is_present: normAtt(x.is_present) }))
     ]
   }

   // ── UNDO toast ────────────────────────────────────────────
   const label = nxt === true ? 'Present' : nxt === false ? 'Absent' : nxt === 'late' ? 'Late' : 'Cleared'
   toast(`Marked ${label}`, 'ok', async () => {
     await db.from('attendance').upsert(
       { session_id: sid, designer_id: did, is_present: prevVal },
       { onConflict: 'session_id,designer_id' }
     )
     await store.loadAll()
   })
}

async function markAll(val) {
   if (!session.value) return
   const targets = enrolled.value.filter(e => isScheduledDes(e.designer_id))
   const strVal = val ? 'true' : 'false'
   const upserts = []
   for(const e of targets) {
      const a = getAtt(e.designer_id)
      const mu = store.makeups.find(m => m.original_session_id === session.value.id && m.designer_id === e.designer_id)
      if (mu?.is_attended === true) continue
      if (!a || a.is_present === null) {
         upserts.push({ session_id: session.value.id, designer_id: e.designer_id, is_present: strVal })
         const idx = store.attendance.findIndex(x => x.session_id === session.value.id && x.designer_id === e.designer_id)
         if (idx > -1) store.attendance[idx].is_present = strVal
         else store.attendance.push({ session_id: session.value.id, designer_id: e.designer_id, is_present: strVal })
      }
   }
   if(upserts.length) {
      db.from('attendance').upsert(upserts, { onConflict: 'session_id,designer_id' }).then(()=>store.loadAll())
   }
}

// Modals
const showAddSess = ref(false)
const newSessDate = ref('')
async function addSession() {
   if(!newSessDate.value) return
   saving.value = true
   const d = new Date(newSessDate.value + 'T00:00:00')
   const { error } = await db.from('training_sessions').insert([{
      training_id: selT.value,
      session_date: newSessDate.value,
      day_of_week: d.toLocaleDateString('en-US', { weekday: 'long' })
   }])
   if (!error) { showAddSess.value = false; await store.loadAll() }
   saving.value = false
}

const confirmDelSess = ref(false)
async function delSession() {
   saving.value = true
   await db.from('training_sessions').delete().eq('id', session.value.id)
   selS.value = null
   confirmDelSess.value = false
   await store.loadAll()
   saving.value = false
}

const showNote = ref(false)
const noteTarget = ref({ sid:null, did:null })
const noteText = ref('')
function openNote(sid, did) {
   noteTarget.value = { sid, did }
   const a = getAtt(did)
   noteText.value = a?.notes || ''
   showNote.value = true
}
async function saveNote() {
   saving.value = true
   const { sid, did } = noteTarget.value
   const { error } = await db.from('attendance').upsert({
      session_id: sid, designer_id: did, notes: noteText.value || null
   }, { onConflict: 'session_id,designer_id' })
   if (!error) { showNote.value = false; await store.loadAll() }
   saving.value = false
}

const showReschedule = ref(false)
const reschedTarget = ref({ sid:null, did:null })
const muDate = ref('')
function openReschedule(sid, did) {
   reschedTarget.value = { sid, did }
   muDate.value = ''
   showReschedule.value = true
}
async function saveProofUrl(sessionId, url) {
  const { error } = await db.from('training_sessions').update({ proof_url: url || null }).eq('id', sessionId)
  if (!error) { toast('Proof link saved'); await store.loadAll() }
  else toast(error.message, 'er')
}

async function saveReschedule() {
   if(!muDate.value) return
   saving.value = true
   const { sid, did } = reschedTarget.value
   const { error } = await db.from('makeup_sessions').insert([{
      designer_id: did, original_session_id: sid, makeup_date: muDate.value
   }])
   if (!error) { showReschedule.value = false; await store.loadAll() }
   saving.value = false
}

function exportCSV() {
   if (!training.value) return
   const rows = [['Designer', 'Team', ...tSess.value.map(s => s.session_date), 'Rate']]
   for (const team of teams.value) {
      for (const d of team.members) {
         const hm = getHeatmap(d.id)
         const rate = getRunRate(d.id) || 0
         rows.push([
            d.name, team.name,
            ...hm.map(h => h.state === 'p' ? 'Present' : h.state === 'a' ? 'Absent' : h.state === 'l' ? 'Late' : 'N/A'),
            rate + '%'
         ])
      }
   }
   const csv = rows.map(e => e.join(',')).join('\n')
   const a = document.createElement('a')
   a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
   a.download = `${training.value.name.replace(/[^a-z0-9]/gi, '_')}_attendance.csv`
   a.click()
}
</script>

<style scoped>
@media(min-width: 641px) {
  .att-hm-mobile { display: flex !important; }
  .att-mark-mobile { display: flex !important; }
}
/* Ensure session grid has 14 cols on desktop and 7 on mobile just like the html file */
.sess-grid { grid-template-columns: repeat(14, 1fr); }
@media(max-width: 640px) {
  .sess-grid { grid-template-columns: repeat(7, 1fr) !important; }
  .hm-cell { width: 13px !important; height: 13px !important; }
  .att-mark-mobile { width: 36px; align-items: center; justify-content: flex-start; flex-direction: column; gap: 4px; }
}
</style>
