<template>
  <div>
    <div class="sh">
      <div>
        <div class="sh-t">Dashboard</div>
        <div class="sh-s">{{ new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase() }}</div>
      </div>
    </div>

    <!-- Overall rate header -->
    <div style="margin-bottom:28px">
      <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:1px;margin-bottom:7px">PRODUCTION / OVERVIEW</div>
      <div style="font-size:52px;font-weight:300;color:var(--t1);font-family:'JetBrains Mono',monospace;letter-spacing:-2.5px;line-height:1">
        {{ overallRate }}<span style="font-size:18px;color:var(--t3)">%</span>
      </div>
      <div style="font-size:11px;color:var(--t3);margin-top:5px">overall attendance</div>
    </div>

    <!-- Alerts -->
    <div v-if="alerts.length" style="border:1px solid rgba(248,113,113,.25);background:var(--r-bg);padding:12px 16px;margin-bottom:20px">
      <div style="font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:.8px;color:var(--r);margin-bottom:8px">⚠ ALERTS</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span v-for="a in alerts" :key="a.id"
          class="abs-badge"
          :style="a.isMakeup ? 'border-color:rgba(96,165,250,.4);color:var(--bl);background:rgba(96,165,250,.1)' : ''">
          {{ a.name }} — {{ a.isMakeup ? 'MAKE-UP OVERDUE ' + fmtDs(a.muDate) : a.count + ' MISSED' }}
        </span>
      </div>
    </div>

    <!-- Stats -->
    <div class="sg" style="margin-bottom:22px">
      <div class="st"><div class="st-l">Designers</div><div class="st-v">{{ store.designers.length }}</div></div>
      <div class="st"><div class="st-l">Active Trainings</div><div class="st-v">{{ activeTrainings.length }}</div></div>
      <div class="st"><div class="st-l">Sessions Logged</div><div class="st-v">{{ store.sessions.length }}</div></div>
      <div class="st"><div class="st-l">Teams</div><div class="st-v">{{ teamCount }}</div></div>
    </div>

    <!-- Attendance by Team + Active Trainings -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:1px;background:var(--bdr);border:1px solid var(--bdr);margin-bottom:16px">
      <div class="card" style="border:none">
        <div class="c-hd"><span class="c-ttl">Attendance by Team</span></div>
        <div v-if="teamStats.length === 0" class="empty"><div class="ec">— NO DATA —</div></div>
        <div v-for="t in teamStats" :key="t.name" style="padding:12px 18px;border-bottom:1px solid var(--bdr-s);display:flex;align-items:center;gap:14px">
          <div style="min-width:96px">
            <div style="font-size:13px;color:var(--t1)">{{ t.name }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">{{ t.count }} MEMBERS</div>
          </div>
          <div style="flex:1;height:4px;background:var(--bdr);overflow:hidden">
            <div style="height:100%;transition:width .5s"
              :style="{ width: t.rate + '%', background: t.rate >= 80 ? 'var(--g)' : t.rate >= 60 ? 'var(--a)' : 'var(--r)' }"></div>
          </div>
          <span style="font-size:11px;font-family:'JetBrains Mono',monospace;min-width:36px;text-align:right"
            :style="{ color: t.rate >= 80 ? 'var(--g)' : t.rate >= 60 ? 'var(--a)' : 'var(--r)' }">{{ t.rate }}%</span>
        </div>
      </div>
      <div class="card" style="border:none">
        <div class="c-hd"><span class="c-ttl">Active Trainings</span></div>
        <div v-if="activeTrainings.length === 0" class="empty"><div class="ec">— NONE —</div></div>
        <div v-for="t in activeTrainings" :key="t.id" style="padding:12px 18px;border-bottom:1px solid var(--bdr-s)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
            <span style="font-size:13px;color:var(--t1)">{{ t.name }}</span>
            <span v-if="t.type === 'Hands-On'" class="tag tag-a">HANDS-ON</span>
            <span v-else class="tag tag-b">DISCUSSION</span>
          </div>
          <div style="height:4px;background:var(--bdr);overflow:hidden;margin-bottom:5px">
            <div style="height:100%;transition:width .5s"
              :style="{ width: tRate(t.id) + '%', background: tRate(t.id) >= 80 ? 'var(--g)' : tRate(t.id) >= 60 ? 'var(--a)' : 'var(--r)' }"></div>
          </div>
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">
            {{ (t.schedule || []).map(d => d.slice(0,3).toUpperCase()).join('·') || '—' }} / TARGET {{ fmtDs(t.target_date).toUpperCase() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming + Top Performers + Ending Soon -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1px;background:var(--bdr);border:1px solid var(--bdr);margin-bottom:16px" class="dash-3col">
      <!-- Upcoming sessions -->
      <div class="card" style="border:none">
        <div class="c-hd"><span class="c-ttl">Upcoming Sessions (7 days)</span></div>
        <div v-if="upcomingSessions.length === 0" class="empty"><div class="ec">— NONE —</div></div>
        <div v-for="s in upcomingSessions" :key="s.id" style="padding:10px 18px;border-bottom:1px solid var(--bdr-s);display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:13px;color:var(--t1)">{{ trainingName(s.training_id) }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:2px">{{ s.day_of_week?.slice(0,3).toUpperCase() || '' }}</div>
          </div>
          <span style="font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--t3)">{{ fmtDs(s.session_date).toUpperCase() }}</span>
        </div>
      </div>

      <!-- Top performers -->
      <div class="card" style="border:none">
        <div class="c-hd"><span class="c-ttl">Top Performers (this month)</span></div>
        <div v-if="topPerformers.length === 0" class="empty"><div class="ec">— NO DATA —</div></div>
        <div v-for="(d, i) in topPerformers" :key="d.id" style="padding:10px 18px;border-bottom:1px solid var(--bdr-s);display:flex;align-items:center;gap:12px">
          <span style="font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--t4);min-width:16px">#{{ i + 1 }}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;color:var(--t1)">{{ d.name }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">{{ d.team }} · {{ d.sessions }} sessions</div>
          </div>
          <span style="font-size:12px;font-family:'JetBrains Mono',monospace;font-weight:500"
            :style="{ color: d.rate >= 80 ? 'var(--g)' : 'var(--a)' }">{{ d.rate }}%</span>
        </div>
      </div>

      <!-- Ending soon -->
      <div class="card" style="border:none">
        <div class="c-hd"><span class="c-ttl">Ending Soon (14 days)</span></div>
        <div v-if="endingSoon.length === 0" class="empty"><div class="ec">— NONE —</div></div>
        <div v-for="t in endingSoon" :key="t.id" style="padding:10px 18px;border-bottom:1px solid var(--bdr-s)">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="font-size:13px;color:var(--t1)">{{ t.name }}</div>
            <span style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--r);border:1px solid rgba(248,113,113,.3);padding:2px 6px">
              {{ daysLeft(t.target_date) }}D LEFT
            </span>
          </div>
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:4px">TARGET: {{ fmtDs(t.target_date).toUpperCase() }}</div>
          <div style="height:4px;background:var(--bdr);overflow:hidden;margin-top:6px">
            <div style="height:100%" :style="{ width: tRate(t.id) + '%', background: tRate(t.id) >= 80 ? 'var(--g)' : tRate(t.id) >= 60 ? 'var(--a)' : 'var(--r)' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skill Coverage by Platform -->
    <div class="card" style="margin-bottom:16px">
      <div class="c-hd">
        <span class="c-ttl">Skill Coverage by Platform</span>
        <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">% of designers with any skill level</span>
      </div>
      <div style="padding:16px 20px;display:grid;grid-template-columns:repeat(auto-fit, minmax(110px, 1fr));gap:16px" class="skill-cov-grid">
        <div v-for="s in skillCoverage" :key="s.platform">
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.6px;margin-bottom:8px">{{ s.platform.toUpperCase() }}</div>
          <div style="height:4px;background:var(--bdr);overflow:hidden;margin-bottom:5px">
            <div style="height:100%;transition:width .5s"
              :style="{ width: s.pct + '%', background: s.pct >= 80 ? 'var(--g)' : s.pct >= 50 ? 'var(--a)' : 'var(--bl)' }"></div>
          </div>
          <div style="font-size:18px;font-weight:300;font-family:'JetBrains Mono',monospace"
            :style="{ color: s.pct >= 80 ? 'var(--g)' : s.pct >= 50 ? 'var(--a)' : 'var(--bl)' }">{{ s.pct }}%</div>
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:2px">{{ s.count }} / {{ store.designers.length }}</div>
        </div>
      </div>
    </div>

    <!-- Recent Sessions -->
    <div class="card">
      <div class="c-hd"><span class="c-ttl">Recent Sessions</span></div>
      <div v-if="recentSessions.length === 0" class="empty"><div class="ec">— NO SESSIONS —</div></div>
      <div v-else class="tw">
        <table>
          <thead>
            <tr><th>Date</th><th>Training</th><th>Present</th><th>Late</th><th>Absent</th><th>Rate</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in recentSessions" :key="s.id">
              <td style="font-family:'JetBrains Mono',monospace;font-size:10px">{{ fmtDs(s.session_date).toUpperCase() }}</td>
              <td class="td1">{{ trainingName(s.training_id) }}</td>
              <td style="color:var(--g);font-family:'JetBrains Mono',monospace">{{ sessStats(s.id).pr }}</td>
              <td style="color:var(--a);font-family:'JetBrains Mono',monospace">{{ sessStats(s.id).lt }}</td>
              <td style="color:var(--r);font-family:'JetBrains Mono',monospace">{{ sessStats(s.id).ab }}</td>
              <td>
                <span style="font-size:11px;font-family:'JetBrains Mono',monospace"
                  :style="{ color: sessStats(s.id).rate >= 80 ? 'var(--g)' : sessStats(s.id).rate >= 60 ? 'var(--a)' : 'var(--r)' }">
                  {{ sessStats(s.id).rate }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { pct, fmtDs, TODAY, PLATFORMS } from '@/lib/utils'

const store = useAppStore()

const activeTrainings = computed(() => store.trainings.filter(t => t.status === 'active'))
const teamCount = computed(() => new Set(store.designers.map(d => d.team).filter(Boolean)).size)

const overallRate = computed(() => {
  const marked = store.attendance.filter(a => a.is_present !== null)
  const present = marked.filter(a => a.is_present === true || a.is_present === 'late')
  return pct(present.length, marked.length)
})

// Alerts — 2+ consecutive absences or overdue makeups
const alerts = computed(() => {
  const out = []
  store.designers.forEach(d => {
    // Consecutive absences
    const sorted = [...store.sessions].sort((a, b) => new Date(b.session_date) - new Date(a.session_date))
    let count = 0
    for (const s of sorted) {
      const a = store.attendance.find(x => x.session_id === s.id && x.designer_id === d.id)
      if (!a || a.is_present === null) break
      if (a.is_present === false) count++
      else break
    }
    if (count >= 2) out.push({ id: d.id + '-abs', name: d.name, count, isMakeup: false })
    // Overdue makeups
    store.makeups.filter(m => m.designer_id === d.id && m.is_attended === null && m.makeup_date < TODAY).forEach(m => {
      out.push({ id: m.id, name: d.name, isMakeup: true, muDate: m.makeup_date })
    })
  })
  return out
})

// Team attendance stats
const teamStats = computed(() => {
  const teams = [...new Set(store.designers.map(d => d.team).filter(Boolean))].sort()
  return teams.map(name => {
    const members = store.designers.filter(d => d.team === name)
    const att = store.attendance.filter(a => {
      const d = store.designers.find(x => x.id === a.designer_id)
      return d?.team === name && a.is_present !== null
    })
    const rate = pct(att.filter(a => a.is_present === true).length, att.length)
    return { name, count: members.length, rate }
  })
})

function tRate(tid) {
  const tS = store.sessions.filter(s => s.training_id === tid)
  const enr = store.enrollments.filter(e => e.training_id === tid).map(e => e.designer_id)
  const tA = store.attendance.filter(a => tS.some(s => s.id === a.session_id) && enr.includes(a.designer_id) && a.is_present !== null)
  return tA.length > 0 ? pct(tA.filter(a => a.is_present === true).length, tA.length) : 0
}

// Upcoming sessions (next 7 days)
const upcomingSessions = computed(() => {
  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().slice(0, 10)
  return store.sessions
    .filter(s => s.session_date >= TODAY && s.session_date <= weekEndStr)
    .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
    .slice(0, 5)
})

function trainingName(tid) {
  return store.trainings.find(t => t.id === tid)?.name || '—'
}

// Top performers this month
const topPerformers = computed(() => {
  const monthStart = new Date()
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const monthSessions = store.sessions.filter(s => new Date(s.session_date + 'T00:00:00') >= monthStart && s.session_date <= TODAY)
  return store.designers.map(d => {
    const mk = store.attendance.filter(a => monthSessions.some(s => s.id === a.session_id) && a.designer_id === d.id && a.is_present !== null)
    const rate = mk.length > 0 ? pct(mk.filter(a => a.is_present === true || a.is_present === 'late').length, mk.length) : null
    return { id: d.id, name: d.name, team: d.team, rate, sessions: mk.length }
  }).filter(d => d.rate !== null && d.sessions >= 2).sort((a, b) => b.rate - a.rate).slice(0, 3)
})

// Ending soon (within 14 days)
const endingSoon = computed(() => {
  const soon = new Date(); soon.setDate(soon.getDate() + 14)
  const soonStr = soon.toISOString().slice(0, 10)
  return store.trainings.filter(t => t.status === 'active' && t.target_date && t.target_date >= TODAY && t.target_date <= soonStr)
})

function daysLeft(date) {
  return Math.ceil((new Date(date + 'T00:00:00') - new Date()) / 864e5)
}

// Skill coverage per platform
const skillCoverage = computed(() =>
  PLATFORMS.map(platform => {
    const count = store.designerSkills.filter(s => s.platform === platform).length
    return { platform, count, pct: pct(count, store.designers.length) }
  })
)

// Recent sessions (last 8)
const recentSessions = computed(() =>
  [...store.sessions]
    .filter(s => s.session_date <= TODAY)
    .sort((a, b) => new Date(b.session_date) - new Date(a.session_date))
    .slice(0, 8)
)

function sessStats(sid) {
  const sA = store.attendance.filter(a => a.session_id === sid)
  const pr = sA.filter(a => a.is_present === true).length
  const lt = sA.filter(a => a.is_present === 'late').length
  const ab = sA.filter(a => a.is_present === false).length
  return { pr, lt, ab, rate: pct(pr + lt, pr + lt + ab) }
}
</script>
