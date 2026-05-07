<template>
  <div>
    <div class="sh">
      <div>
        <div class="sh-t">History</div>
        <div class="sh-s">Your full attendance record</div>
      </div>
    </div>

    <div v-if="!d" class="empty"><div class="ec">— PROFILE NOT FOUND —</div></div>
    <template v-else>

      <!-- Summary Stats -->
      <div class="sg" style="grid-template-columns:repeat(auto-fit, minmax(100px, 1fr));margin-bottom:20px">
        <div class="st"><div class="st-l">Total Sessions</div><div class="st-v">{{ totalSessions }}</div></div>
        <div class="st"><div class="st-l">Present</div><div class="st-v" style="color:var(--g)">{{ totalPresent }}</div></div>
        <div class="st"><div class="st-l">Late</div><div class="st-v" style="color:var(--a)">{{ totalLate }}</div></div>
        <div class="st"><div class="st-l">Absent</div><div class="st-v" style="color:var(--r)">{{ totalAbsent }}</div></div>
      </div>

      <!-- No history -->
      <div v-if="myTrainings.length === 0" class="empty">
        <div class="ec">— NO TRAINING HISTORY —</div>
      </div>

      <!-- Per-Training History -->
      <div v-for="t in myTrainings" :key="t.id" style="margin-bottom:16px">
        <div style="border:1px solid var(--bdr)">
          <!-- Training header -->
          <div style="padding:12px 18px;background:var(--sur);border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:14px;color:var(--t1)">{{ t.name }}</div>
              <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:3px;display:flex;gap:6px;align-items:center">
                <span class="tag">{{ t.type }}</span>
                <span class="tag">{{ t.status }}</span>
                <span v-if="t.start_date">{{ fmtDs(t.start_date) }} – {{ fmtDs(t.target_date) }}</span>
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:22px;font-weight:300;font-family:'JetBrains Mono',monospace"
                :style="{ color: getTrainingRate(t.id) >= 80 ? 'var(--g)' : getTrainingRate(t.id) >= 60 ? 'var(--a)' : 'var(--r)' }">
                {{ getTrainingRate(t.id) }}%
              </div>
              <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">ATTENDANCE</div>
            </div>
          </div>

          <!-- Session rows -->
          <div v-if="getTrainingSessions(t.id).length === 0" style="padding:14px 18px;font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace">
            — No sessions —
          </div>
          <div v-for="s in getTrainingSessions(t.id)" :key="s.id"
            style="padding:10px 18px;border-bottom:1px solid var(--bdr-s);display:flex;align-items:center;gap:12px">
            <!-- Dot -->
            <div style="width:10px;height:10px;border-radius:50%;flex-shrink:0"
              :style="{ background: dotColor(s.id) }">
            </div>
            <!-- Date -->
            <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--t3);min-width:80px">
              {{ fmtDs(s.session_date).toUpperCase() }}
            </span>
            <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;min-width:60px">
              {{ s.day_of_week?.slice(0, 3).toUpperCase() || '' }}
            </span>
            <!-- Status badge -->
            <span style="font-size:9px;font-family:'JetBrains Mono',monospace;padding:2px 8px;letter-spacing:.5px"
              :style="attStyle(s.id)">
              {{ attLabel(s.id) }}
            </span>
            <!-- Note -->
            <span v-if="getNote(s.id)" style="font-size:10px;color:var(--t4);font-style:italic;flex:1">
              {{ getNote(s.id) }}
            </span>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { pct, fmtDs } from '@/lib/utils'

const store = useAppStore()
const d = computed(() => store.designer)

const myEnrollments = computed(() => d.value ? store.enrollments.filter(e => e.designer_id === d.value.id) : [])
const myTrainings = computed(() =>
  store.trainings
    .filter(t => myEnrollments.value.some(e => e.training_id === t.id))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
)

const allMyAtt = computed(() => {
  if (!d.value) return []
  const mySessionIds = store.sessions.filter(s => myEnrollments.value.some(e => e.training_id === s.training_id)).map(s => s.id)
  return store.attendance.filter(a => mySessionIds.includes(a.session_id) && a.designer_id === d.value.id && a.is_present !== null)
})

const totalSessions = computed(() => allMyAtt.value.length)
const totalPresent = computed(() => allMyAtt.value.filter(a => a.is_present === true).length)
const totalLate = computed(() => allMyAtt.value.filter(a => a.is_present === 'late').length)
const totalAbsent = computed(() => allMyAtt.value.filter(a => a.is_present === false).length)

function getTrainingSessions(tid) {
  return store.sessions.filter(s => s.training_id === tid).sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
}

function getTrainingRate(tid) {
  if (!d.value) return 0
  const tS = store.sessions.filter(s => s.training_id === tid)
  const mk = store.attendance.filter(a => tS.some(s => s.id === a.session_id) && a.designer_id === d.value.id && a.is_present !== null)
  return pct(mk.filter(a => a.is_present === true || a.is_present === 'late').length, mk.length)
}

function getAtt(sid) {
  if (!d.value) return null
  return store.attendance.find(a => a.session_id === sid && a.designer_id === d.value.id) || null
}

function getMakeup(sid) {
  if (!d.value) return null
  return store.makeups.find(m => m.original_session_id === sid && m.designer_id === d.value.id) || null
}

function attLabel(sid) {
  const mu = getMakeup(sid)
  const a = getAtt(sid)
  if (mu?.is_attended === true) return 'MADE UP'
  if (mu?.is_attended === null) return 'MU PENDING'
  if (a?.is_present === true) return 'PRESENT'
  if (a?.is_present === 'late') return 'LATE'
  if (a?.is_present === false) return 'ABSENT'
  return 'UNMARKED'
}

function attStyle(sid) {
  const lbl = attLabel(sid)
  if (lbl === 'PRESENT' || lbl === 'MADE UP') return { color: 'var(--g)', border: '1px solid rgba(74,222,128,.3)', background: 'var(--g-bg)' }
  if (lbl === 'LATE') return { color: 'var(--a)', border: '1px solid rgba(251,191,36,.3)', background: 'var(--a-bg)' }
  if (lbl === 'ABSENT') return { color: 'var(--r)', border: '1px solid rgba(248,113,113,.3)', background: 'var(--r-bg)' }
  if (lbl === 'MU PENDING') return { color: 'var(--bl)', border: '1px solid rgba(96,165,250,.3)', background: 'rgba(96,165,250,.08)' }
  return { color: 'var(--t4)', border: '1px solid var(--bdr)' }
}

function dotColor(sid) {
  const lbl = attLabel(sid)
  if (lbl === 'PRESENT' || lbl === 'MADE UP') return 'var(--g)'
  if (lbl === 'LATE') return 'var(--a)'
  if (lbl === 'ABSENT') return 'var(--r)'
  if (lbl === 'MU PENDING') return 'var(--bl)'
  return 'var(--bdr)'
}

function getNote(sid) {
  return getAtt(sid)?.notes || null
}
</script>
