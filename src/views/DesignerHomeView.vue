<template>
  <div>
    <div v-if="!d" class="empty"><div class="ec">— PROFILE NOT FOUND —</div></div>
    <template v-else>

      <!-- Profile Header -->
      <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:24px;padding-bottom:22px;border-bottom:1px solid var(--bdr)">
        <div style="width:52px;height:52px;background:var(--sur-h);border:1px solid var(--bdr-h);display:flex;align-items:center;justify-content:center;font-size:17px;font-family:'JetBrains Mono',monospace;color:var(--t2);flex-shrink:0">
          {{ init(d.name) }}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:1px;margin-bottom:5px">DESIGNER / HOME</div>
          <div style="font-size:24px;font-weight:300;color:var(--t1);letter-spacing:-.3px;margin-bottom:5px">{{ d.name }}</div>
          <div style="display:flex;gap:7px;align-items:center;flex-wrap:wrap">
            <span class="tag">{{ (d.rank || '—').toUpperCase() }}</span>
            <span class="tag">TEAM {{ (d.team || '—').toUpperCase() }}</span>
            <span v-if="streak > 0" style="display:inline-flex;align-items:center;gap:4px;font-size:10px;color:var(--a);font-family:'JetBrains Mono',monospace">
              🔥 {{ streak }}-session streak
            </span>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:52px;font-weight:300;font-family:'JetBrains Mono',monospace;letter-spacing:-2px;line-height:1"
            :style="{ color: rate >= 80 ? 'var(--g)' : rate >= 60 ? 'var(--a)' : 'var(--r)' }">
            {{ rate }}<span style="font-size:18px;color:var(--t3)">%</span>
          </div>
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:3px">OVERALL</div>
          <div style="display:inline-flex;align-items:center;gap:4px;margin-top:6px;padding:3px 8px"
            :style="{ border: `1px solid ${standing.color}`, background: standing.color + '18' }">
            <span style="font-size:10px" :style="{ color: standing.color }">{{ standing.icon }}</span>
            <span style="font-size:8px;font-family:'JetBrains Mono',monospace;letter-spacing:.5px" :style="{ color: standing.color }">{{ standing.label }}</span>
          </div>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="sg" style="grid-template-columns:repeat(5,1fr);margin-bottom:20px">
        <div class="st"><div class="st-l">Enrolled</div><div class="st-v">{{ myT.length }}</div></div>
        <div class="st"><div class="st-l">Attended</div><div class="st-v" style="color:var(--g)">{{ present.length }}</div></div>
        <div class="st"><div class="st-l">Absent</div><div class="st-v" style="color:var(--r)">{{ absent.length }}</div></div>
        <div class="st"><div class="st-l">Active</div><div class="st-v">{{ myT.filter(t => t.status === 'active').length }}</div></div>
        <div class="st">
          <div class="st-l">Make-ups</div>
          <div class="st-v" :style="{ color: pendingMu.length ? 'var(--bl)' : 'var(--t1)' }">{{ pendingMu.length }}</div>
          <div class="st-s">pending</div>
        </div>
      </div>

      <!-- Today + Trend row -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
        <!-- Today's Session -->
        <div class="card">
          <div class="c-hd">
            <span class="c-ttl">Today</span>
            <span style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--t4)">{{ fmtDs(TODAY).toUpperCase() }}</span>
          </div>
          <div v-if="todaySessions.length === 0" style="padding:18px;font-size:11px;color:var(--t4);font-family:'JetBrains Mono',monospace">
            No sessions today
          </div>
          <div v-for="s in todaySessions" :key="s.id" style="padding:12px 18px;border-bottom:1px solid var(--bdr-s)">
            <div style="font-size:13px;color:var(--t1)">{{ trainingName(s.training_id) }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:3px">
              {{ myAttLabel(s.id) }}
            </div>
          </div>
        </div>

        <!-- This Month / Last Month -->
        <div style="display:grid;grid-template-rows:1fr 1fr;gap:1px;background:var(--bdr);border:1px solid var(--bdr)">
          <div style="background:var(--bg);padding:14px 18px">
            <div class="c-ttl" style="margin-bottom:8px">This Month</div>
            <div style="display:flex;align-items:baseline;justify-content:space-between">
              <div style="font-size:36px;font-weight:300;font-family:'JetBrains Mono',monospace"
                :style="{ color: rateThis >= 80 ? 'var(--g)' : rateThis >= 60 ? 'var(--a)' : attThisMonth.length ? 'var(--r)' : 'var(--t4)' }">
                {{ attThisMonth.length ? rateThis : '—' }}<span style="font-size:14px;color:var(--t3)">{{ attThisMonth.length ? '%' : '' }}</span>
              </div>
              <div style="text-align:right">
                <div style="font-size:28px;font-weight:300" :style="{ color: trendColor }">{{ trend }}</div>
                <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">vs last month</div>
              </div>
            </div>
          </div>
          <div style="background:var(--bg);padding:14px 18px">
            <div class="c-ttl" style="margin-bottom:8px">Last Month</div>
            <div style="font-size:36px;font-weight:300;font-family:'JetBrains Mono',monospace"
              :style="{ color: rateLast >= 80 ? 'var(--g)' : rateLast >= 60 ? 'var(--a)' : attLastMonth.length ? 'var(--r)' : 'var(--t4)' }">
              {{ attLastMonth.length ? rateLast : '—' }}<span style="font-size:14px;color:var(--t3)">{{ attLastMonth.length ? '%' : '' }}</span>
            </div>
            <div style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:4px">{{ attLastMonth.length }} sessions recorded</div>
          </div>
        </div>
      </div>

      <!-- Recent Skill Awards -->
      <div v-if="recentSkills.length" class="card" style="margin-bottom:14px">
        <div class="c-hd">
          <span class="c-ttl">🏆 Recent Awards</span>
          <span style="font-size:9px;color:var(--g);font-family:'JetBrains Mono',monospace">LAST 14 DAYS</span>
        </div>
        <div v-for="sk in recentSkills" :key="sk.platform" style="padding:12px 18px;border-bottom:1px solid var(--bdr-s);display:flex;align-items:center;gap:12px">
          <span style="font-size:20px">🎖</span>
          <div style="flex:1">
            <div style="font-size:13px;color:var(--t1)">{{ sk.platform }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:2px">{{ sk.source || 'training' }}</div>
          </div>
          <span style="font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:.6px;padding:3px 10px"
            :style="{ border: `1px solid ${LEVEL_COLOR[sk.level]}`, background: LEVEL_COLOR[sk.level] + '18', color: LEVEL_COLOR[sk.level] }">
            {{ (sk.level || '').toUpperCase() }}
          </span>
        </div>
      </div>

      <!-- My Skill Set -->
      <div class="card" style="margin-bottom:14px">
        <div class="c-hd"><span class="c-ttl">My Skill Set</span></div>
        <div style="padding:14px 18px">
          <div v-for="pl in PLATFORMS" :key="pl"
            style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--bdr-s)">
            <span style="font-size:12px;color:var(--t2)">{{ pl }}</span>
            <span v-if="getSkillLevel(pl)"
              style="font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:.6px;padding:3px 10px"
              :style="{ border: `1px solid ${LEVEL_COLOR[getSkillLevel(pl)]}`, background: LEVEL_COLOR[getSkillLevel(pl)] + '18', color: LEVEL_COLOR[getSkillLevel(pl)] }">
              {{ getSkillLevel(pl).toUpperCase() }}
            </span>
            <span v-else style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace">—</span>
          </div>
        </div>
      </div>

      <!-- Pending Make-ups -->
      <div v-if="pendingMu.length" class="card" style="margin-bottom:14px">
        <div class="c-hd">
          <span class="c-ttl">⏰ Pending Make-ups</span>
          <span style="font-size:9px;color:var(--bl);font-family:'JetBrains Mono',monospace">{{ pendingMu.length }} SCHEDULED</span>
        </div>
        <div v-for="m in pendingMu" :key="m.id" style="padding:12px 18px;border-bottom:1px solid var(--bdr-s);display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:13px;color:var(--t1)">{{ trainingName(m.training_id) }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:2px">
              Originally: {{ fmtDs(m.original_date) }}
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--bl)">{{ fmtDs(m.makeup_date) }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">MAKE-UP DATE</div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { pct, init, fmtDs, TODAY, PLATFORMS, LEVEL_COLOR } from '@/lib/utils'

const store = useAppStore()

const d = computed(() => store.designer)

const myT = computed(() => {
  if (!d.value) return []
  return store.trainings.filter(t => store.enrollments.some(e => e.training_id === t.id && e.designer_id === d.value.id))
})

const mySe = computed(() => store.sessions.filter(s => myT.value.some(t => t.id === s.training_id)))

const myA = computed(() => {
  if (!d.value) return []
  return store.attendance.filter(a => mySe.value.some(s => s.id === a.session_id) && a.designer_id === d.value.id && a.is_present !== null)
})

const present = computed(() => myA.value.filter(a => a.is_present === true || a.is_present === 'late'))
const absent = computed(() => myA.value.filter(a => a.is_present === false))
const rate = computed(() => pct(present.value.length, myA.value.length))

const myMakeups = computed(() => d.value ? store.makeups.filter(m => m.designer_id === d.value.id) : [])
const mySkills = computed(() => d.value ? store.designerSkills.filter(s => s.designer_id === d.value.id) : [])
const pendingMu = computed(() => myMakeups.value.filter(m => m.is_attended === null))

// Standing
const standing = computed(() => {
  const r = rate.value
  if (r >= 90) return { label: 'EXCELLENT', icon: '⚡', color: 'var(--g)' }
  if (r >= 80) return { label: 'GOOD', icon: '✓', color: 'var(--g)' }
  if (r >= 70) return { label: 'SATISFACTORY', icon: '◐', color: 'var(--a)' }
  if (r >= 60) return { label: 'NEEDS WORK', icon: '⚠', color: 'var(--a)' }
  return { label: 'AT RISK', icon: '✗', color: 'var(--r)' }
})

// Attendance streak (consecutive present sessions)
const streak = computed(() => {
  if (!d.value) return 0
  const sorted = [...store.sessions].sort((a, b) => new Date(b.session_date) - new Date(a.session_date))
  let c = 0
  for (const s of sorted) {
    const a = store.attendance.find(x => x.session_id === s.id && x.designer_id === d.value.id)
    if (!a || a.is_present === null) break
    if (a.is_present === true || a.is_present === 'late') c++
    else break
  }
  return c
})

// Today's sessions
const todaySessions = computed(() => {
  if (!d.value) return []
  return store.sessions.filter(s => {
    if (s.session_date !== TODAY) return false
    return store.enrollments.some(e => e.training_id === s.training_id && e.designer_id === d.value.id)
  })
})

// Monthly attendance
const now = new Date()
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10)
const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10)

const attThisMonth = computed(() => {
  if (!d.value) return []
  return myA.value.filter(a => {
    const s = store.sessions.find(x => x.id === a.session_id)
    return s && s.session_date >= monthStart && s.session_date <= TODAY
  })
})

const attLastMonth = computed(() => {
  if (!d.value) return []
  return myA.value.filter(a => {
    const s = store.sessions.find(x => x.id === a.session_id)
    return s && s.session_date >= lastMonthStart && s.session_date <= lastMonthEnd
  })
})

const rateThis = computed(() => pct(attThisMonth.value.filter(a => a.is_present === true || a.is_present === 'late').length, attThisMonth.value.length))
const rateLast = computed(() => pct(attLastMonth.value.filter(a => a.is_present === true || a.is_present === 'late').length, attLastMonth.value.length))

const trend = computed(() => {
  if (!attThisMonth.value.length || !attLastMonth.value.length) return '—'
  if (rateThis.value > rateLast.value) return '↑'
  if (rateThis.value < rateLast.value) return '↓'
  return '→'
})
const trendColor = computed(() => trend.value === '↑' ? 'var(--g)' : trend.value === '↓' ? 'var(--r)' : 'var(--t3)')

// Recent skill awards (last 14 days)
const recentSkills = computed(() =>
  mySkills.value
    .filter(sk => sk.updated_at && new Date(sk.updated_at) > new Date(Date.now() - 14 * 86400000))
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 3)
)

// Helpers
function trainingName(tid) {
  return store.trainings.find(t => t.id === tid)?.name || '—'
}

function myAttLabel(sid) {
  if (!d.value) return 'UNMARKED'
  const a = store.attendance.find(x => x.session_id === sid && x.designer_id === d.value.id)
  if (a?.is_present === true) return '✓ PRESENT'
  if (a?.is_present === 'late') return '~ LATE'
  if (a?.is_present === false) return '✗ ABSENT'
  return '— UNMARKED'
}

function getSkillLevel(platform) {
  return mySkills.value.find(s => s.platform === platform)?.level || null
}
</script>
