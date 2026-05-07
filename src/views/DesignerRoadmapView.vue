<template>
  <div>
    <div class="sh">
      <div>
        <div class="sh-t">Roadmap</div>
        <div class="sh-s">Your training progress and upcoming schedule</div>
      </div>
    </div>

    <div v-if="!d" class="empty"><div class="ec">— PROFILE NOT FOUND —</div></div>
    <template v-else>

      <!-- Active Trainings -->
      <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:10px">
        ACTIVE TRAININGS — {{ activeTrainings.length }}
      </div>

      <div v-if="activeTrainings.length === 0" class="empty" style="margin-bottom:20px">
        <div class="ec">— NO ACTIVE TRAININGS —</div>
      </div>

      <div v-for="t in activeTrainings" :key="t.id" class="card" style="margin-bottom:12px">
        <div style="padding:14px 18px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:14px;color:var(--t1)">{{ t.name }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:3px;display:flex;gap:6px">
              <span class="tag">{{ t.type }}</span>
              <span v-if="t.platform" class="tag">{{ t.platform }}</span>
              <span v-if="t.target_date">TARGET {{ fmtDs(t.target_date).toUpperCase() }}</span>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:26px;font-weight:300;font-family:'JetBrains Mono',monospace"
              :style="{ color: getTrainingRate(t.id) >= 80 ? 'var(--g)' : getTrainingRate(t.id) >= 60 ? 'var(--a)' : 'var(--r)' }">
              {{ getTrainingRate(t.id) }}%
            </div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">ATTENDANCE</div>
          </div>
        </div>

        <!-- Progress bar -->
        <div style="padding:10px 18px;border-bottom:1px solid var(--bdr)">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px">
            <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">SESSIONS COMPLETED</span>
            <span style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--t2)">
              {{ getSessionsAttended(t.id) }} / {{ getTrainingSessions(t.id).length }}
            </span>
          </div>
          <div style="height:4px;background:var(--bdr);overflow:hidden">
            <div style="height:100%;transition:width .5s"
              :style="{ width: sessionPct(t.id) + '%', background: sessionPct(t.id) >= 80 ? 'var(--g)' : sessionPct(t.id) >= 50 ? 'var(--a)' : 'var(--bl)' }">
            </div>
          </div>
        </div>

        <!-- Heatmap -->
        <div style="padding:10px 18px;display:flex;flex-wrap:wrap;gap:3px">
          <div v-for="s in getTrainingSessions(t.id)" :key="s.id"
            style="width:14px;height:14px;border:1px solid var(--bdr-s);flex-shrink:0"
            :style="{ background: sessionBg(s.id) }"
            :title="`${fmtDs(s.session_date)} — ${sessionLabel(s.id)}`">
          </div>
          <div v-if="getTrainingSessions(t.id).length === 0"
            style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">
            No sessions yet
          </div>
        </div>

        <!-- Skill target -->
        <div v-if="t.skill_name && t.skill_level" style="padding:10px 18px;border-top:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace">SKILL TARGET</span>
          <span style="font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:.6px;padding:3px 10px"
            :style="{ border: `1px solid ${LEVEL_COLOR[t.skill_level]}`, background: LEVEL_COLOR[t.skill_level] + '18', color: LEVEL_COLOR[t.skill_level] }">
            {{ t.skill_name }} — {{ t.skill_level.toUpperCase() }}
          </span>
        </div>
      </div>

      <!-- Upcoming Sessions (next 7 days) -->
      <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:10px;margin-top:8px">
        UPCOMING — NEXT 7 DAYS
      </div>

      <div v-if="upcomingSessions.length === 0" class="empty" style="margin-bottom:20px">
        <div class="ec">— NO SESSIONS THIS WEEK —</div>
      </div>

      <div class="card" v-else style="margin-bottom:20px">
        <div v-for="s in upcomingSessions" :key="s.id"
          style="padding:12px 18px;border-bottom:1px solid var(--bdr-s);display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:13px;color:var(--t1)">{{ trainingName(s.training_id) }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:2px">
              {{ s.day_of_week?.toUpperCase() || '' }}
            </div>
          </div>
          <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--t3)">
            {{ fmtDs(s.session_date).toUpperCase() }}
          </span>
        </div>
      </div>

      <!-- Upcoming Trainings (enrolled, not yet active) -->
      <div v-if="upcomingTrainings.length">
        <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:10px">
          ENROLLED — UPCOMING TRAININGS
        </div>
        <div v-for="t in upcomingTrainings" :key="t.id"
          style="border:1px solid var(--bdr);margin-bottom:8px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:13px;color:var(--t1)">{{ t.name }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:3px">
              <span class="tag">{{ t.type }}</span>
              <span v-if="t.start_date" style="margin-left:6px">STARTS {{ fmtDs(t.start_date).toUpperCase() }}</span>
            </div>
          </div>
          <span class="tag" style="color:var(--bl);border-color:rgba(96,165,250,.3)">UPCOMING</span>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { pct, fmtDs, TODAY, LEVEL_COLOR } from '@/lib/utils'

const store = useAppStore()
const d = computed(() => store.designer)

const myEnrollments = computed(() => d.value ? store.enrollments.filter(e => e.designer_id === d.value.id) : [])
const myTrainings = computed(() => store.trainings.filter(t => myEnrollments.value.some(e => e.training_id === t.id)))
const activeTrainings = computed(() => myTrainings.value.filter(t => t.status === 'active'))
const upcomingTrainings = computed(() => myTrainings.value.filter(t => t.status === 'upcoming'))

const weekEnd = new Date()
weekEnd.setDate(weekEnd.getDate() + 7)
const weekEndStr = weekEnd.toISOString().slice(0, 10)

const upcomingSessions = computed(() => {
  if (!d.value) return []
  return store.sessions
    .filter(s => s.session_date >= TODAY && s.session_date <= weekEndStr && myEnrollments.value.some(e => e.training_id === s.training_id))
    .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
    .slice(0, 8)
})

function getTrainingSessions(tid) {
  return store.sessions.filter(s => s.training_id === tid).sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
}

function getTrainingRate(tid) {
  if (!d.value) return 0
  const tS = store.sessions.filter(s => s.training_id === tid)
  const mk = store.attendance.filter(a => tS.some(s => s.id === a.session_id) && a.designer_id === d.value.id && a.is_present !== null)
  return pct(mk.filter(a => a.is_present === true || a.is_present === 'late').length, mk.length)
}

function getSessionsAttended(tid) {
  if (!d.value) return 0
  const tS = store.sessions.filter(s => s.training_id === tid)
  return store.attendance.filter(a => tS.some(s => s.id === a.session_id) && a.designer_id === d.value.id && (a.is_present === true || a.is_present === 'late')).length
}

function sessionPct(tid) {
  const total = getTrainingSessions(tid).length
  return total ? pct(getSessionsAttended(tid), total) : 0
}

function sessionBg(sid) {
  if (!d.value) return 'transparent'
  const mu = store.makeups.find(m => m.original_session_id === sid && m.designer_id === d.value.id)
  const a = store.attendance.find(x => x.session_id === sid && x.designer_id === d.value.id)
  if (mu?.is_attended === true) return 'var(--g-bg)'
  if (mu?.is_attended === null) return 'rgba(96,165,250,.15)'
  if (a?.is_present === true) return 'var(--g-bg)'
  if (a?.is_present === 'late') return 'var(--a-bg)'
  if (a?.is_present === false) return 'var(--r-bg)'
  return 'transparent'
}

function sessionLabel(sid) {
  if (!d.value) return 'UNMARKED'
  const mu = store.makeups.find(m => m.original_session_id === sid && m.designer_id === d.value.id)
  const a = store.attendance.find(x => x.session_id === sid && x.designer_id === d.value.id)
  if (mu?.is_attended === true) return 'MADE UP'
  if (mu?.is_attended === null) return 'MU PENDING'
  if (a?.is_present === true) return 'PRESENT'
  if (a?.is_present === 'late') return 'LATE'
  if (a?.is_present === false) return 'ABSENT'
  return 'UNMARKED'
}

function trainingName(tid) {
  return store.trainings.find(t => t.id === tid)?.name || '—'
}
</script>
