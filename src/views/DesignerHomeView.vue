<template>
  <div v-if="!d" class="empty"><div class="ec">— PROFILE NOT FOUND —</div></div>
  <div v-else class="des-home">

    <!-- ── HERO ─────────────────────────────────────────────── -->
    <div class="hero">
      <div class="hero-bg" :style="{ background: heroBg }"></div>
      <div class="hero-inner">
        <div class="hero-left">
          <div class="hero-greeting">{{ greeting }},</div>
          <div class="hero-name">{{ firstName }}</div>
          <div class="hero-meta">
            <span class="tag">{{ (d.rank || '—').toUpperCase() }}</span>
            <span class="tag">TEAM {{ (d.team || '—').toUpperCase() }}</span>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-rate" :style="{ color: rateColor }">
            {{ rate }}<span class="hero-pct">%</span>
          </div>
          <div class="hero-rate-lbl">overall attendance</div>
          <div class="standing-badge" :style="{ borderColor: standing.color, color: standing.color, background: standing.color + '18' }">
            {{ standing.icon }} {{ standing.label }}
          </div>
        </div>
      </div>
      <div v-if="streak > 0" class="streak-bar">
        <span class="streak-fire">🔥</span>
        <span class="streak-count">{{ streak }}-session streak</span>
        <span class="streak-sub">Keep it going!</span>
      </div>
    </div>

    <!-- ── TODAY ─────────────────────────────────────────────── -->
    <div v-if="todaySessions.length" class="today-card">
      <div class="today-hd">
        <div class="today-dot"></div>
        <span class="today-ttl">TODAY · {{ fmtDs(TODAY).toUpperCase() }}</span>
      </div>
      <div v-for="s in todaySessions" :key="s.id" class="today-sess">
        <div class="today-name">{{ trainingName(s.training_id) }}</div>
        <div class="today-status" :class="myAttClass(s.id)">{{ myAttLabel(s.id) }}</div>
      </div>
    </div>

    <!-- ── QUICK STATS ────────────────────────────────────────── -->
    <div class="qs-grid">
      <div class="qs-card">
        <div class="qs-val" style="color:var(--g)">{{ present.length }}</div>
        <div class="qs-lbl">Attended</div>
      </div>
      <div class="qs-card">
        <div class="qs-val" style="color:var(--r)">{{ absent.length }}</div>
        <div class="qs-lbl">Absences</div>
      </div>
      <div class="qs-card">
        <div class="qs-val">{{ myT.filter(t => t.status === 'active').length }}</div>
        <div class="qs-lbl">Active</div>
      </div>
      <div class="qs-card" :class="{ 'qs-alert': pendingMu.length > 0 }">
        <div class="qs-val" :style="{ color: pendingMu.length ? 'var(--bl)' : 'var(--t1)' }">{{ pendingMu.length }}</div>
        <div class="qs-lbl">Make-ups</div>
      </div>
    </div>

    <!-- ── MONTHLY TREND ─────────────────────────────────────── -->
    <div class="trend-row">
      <div class="trend-card">
        <div class="trend-lbl">THIS MONTH</div>
        <div class="trend-val" :style="{ color: attThisMonth.length ? (rateThis >= 80 ? 'var(--g)' : rateThis >= 60 ? 'var(--a)' : 'var(--r)') : 'var(--t4)' }">
          {{ attThisMonth.length ? rateThis + '%' : '—' }}
        </div>
        <div class="trend-sessions">{{ attThisMonth.length }} sessions</div>
      </div>
      <div class="trend-arrow" :style="{ color: trendColor }">{{ trend }}</div>
      <div class="trend-card">
        <div class="trend-lbl">LAST MONTH</div>
        <div class="trend-val" :style="{ color: attLastMonth.length ? (rateLast >= 80 ? 'var(--g)' : rateLast >= 60 ? 'var(--a)' : 'var(--r)') : 'var(--t4)' }">
          {{ attLastMonth.length ? rateLast + '%' : '—' }}
        </div>
        <div class="trend-sessions">{{ attLastMonth.length }} sessions</div>
      </div>
    </div>

    <!-- ── RECENT AWARDS ─────────────────────────────────────── -->
    <div v-if="recentSkills.length" class="section">
      <div class="section-hd">
        <span class="section-ttl">🏆 Recent Awards</span>
        <span class="section-sub">LAST 14 DAYS</span>
      </div>
      <div class="awards-row">
        <div v-for="sk in recentSkills" :key="sk.platform" class="award-card"
          :style="{ borderColor: LEVEL_COLOR[sk.level] + '80', background: LEVEL_COLOR[sk.level] + '0d' }">
          <div class="award-medal">{{ sk.level === 'Expert' ? '🥇' : sk.level === 'Advanced' ? '🥈' : '🥉' }}</div>
          <div class="award-platform">{{ sk.platform }}</div>
          <div class="award-level" :style="{ color: LEVEL_COLOR[sk.level] }">{{ sk.level }}</div>
        </div>
      </div>
    </div>

    <!-- ── SKILL SET ──────────────────────────────────────────── -->
    <div class="section">
      <div class="section-hd">
        <span class="section-ttl">My Skills</span>
        <span class="section-sub">{{ mySkills.length }} / {{ PLATFORMS.length }} PLATFORMS</span>
      </div>
      <div class="skills-grid">
        <div v-for="pl in PLATFORMS" :key="pl" class="skill-pill"
          :class="{ 'skill-earned': !!getSkillLevel(pl) }"
          :style="getSkillLevel(pl) ? { borderColor: LEVEL_COLOR[getSkillLevel(pl)] + '80', background: LEVEL_COLOR[getSkillLevel(pl)] + '10', color: LEVEL_COLOR[getSkillLevel(pl)] } : {}">
          <span class="skill-name">{{ pl }}</span>
          <span v-if="getSkillLevel(pl)" class="skill-lvl">{{ getSkillLevel(pl).slice(0,3).toUpperCase() }}</span>
          <span v-else class="skill-none">—</span>
        </div>
      </div>
    </div>

    <!-- ── PENDING MAKE-UPS ───────────────────────────────────── -->
    <div v-if="pendingMu.length" class="section">
      <div class="section-hd">
        <span class="section-ttl">⏰ Pending Make-ups</span>
        <span class="section-sub" style="color:var(--bl)">{{ pendingMu.length }} SCHEDULED</span>
      </div>
      <div class="mu-list">
        <div v-for="m in pendingMu" :key="m.id" class="mu-item">
          <div>
            <div class="mu-training">{{ trainingName(m.training_id) }}</div>
            <div class="mu-original">Originally {{ fmtDs(m.original_date) }}</div>
          </div>
          <div class="mu-date">{{ fmtDs(m.makeup_date) }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { pct, fmtDs, TODAY, PLATFORMS, LEVEL_COLOR } from '@/lib/utils'

const store = useAppStore()
const d = computed(() => store.designer)

const firstName = computed(() => d.value?.name?.split(' ')[0] || '')
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})

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
const rateColor = computed(() => rate.value >= 80 ? 'var(--g)' : rate.value >= 60 ? 'var(--a)' : 'var(--r)')
const mySkills = computed(() => d.value ? store.designerSkills.filter(s => s.designer_id === d.value.id) : [])
const myMakeups = computed(() => d.value ? store.makeups.filter(m => m.designer_id === d.value.id) : [])
const pendingMu = computed(() => myMakeups.value.filter(m => m.is_attended === null))

const heroBg = computed(() => {
  const r = rate.value
  if (r >= 80) return 'linear-gradient(135deg, rgba(74,222,128,.06) 0%, transparent 60%)'
  if (r >= 60) return 'linear-gradient(135deg, rgba(251,191,36,.06) 0%, transparent 60%)'
  return 'linear-gradient(135deg, rgba(248,113,113,.06) 0%, transparent 60%)'
})

const standing = computed(() => {
  const r = rate.value
  if (r >= 90) return { label: 'EXCELLENT', icon: '⚡', color: 'var(--g)' }
  if (r >= 80) return { label: 'GOOD STANDING', icon: '✓', color: 'var(--g)' }
  if (r >= 70) return { label: 'SATISFACTORY', icon: '◐', color: 'var(--a)' }
  if (r >= 60) return { label: 'NEEDS WORK', icon: '⚠', color: 'var(--a)' }
  return { label: 'AT RISK', icon: '✗', color: 'var(--r)' }
})

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

const todaySessions = computed(() => {
  if (!d.value) return []
  return store.sessions.filter(s => s.session_date === TODAY && store.enrollments.some(e => e.training_id === s.training_id && e.designer_id === d.value.id))
})

const now = new Date()
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10)
const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10)

const attThisMonth = computed(() => myA.value.filter(a => {
  const s = store.sessions.find(x => x.id === a.session_id)
  return s && s.session_date >= monthStart && s.session_date <= TODAY
}))
const attLastMonth = computed(() => myA.value.filter(a => {
  const s = store.sessions.find(x => x.id === a.session_id)
  return s && s.session_date >= lastMonthStart && s.session_date <= lastMonthEnd
}))
const rateThis = computed(() => pct(attThisMonth.value.filter(a => a.is_present === true || a.is_present === 'late').length, attThisMonth.value.length))
const rateLast = computed(() => pct(attLastMonth.value.filter(a => a.is_present === true || a.is_present === 'late').length, attLastMonth.value.length))
const trend = computed(() => {
  if (!attThisMonth.value.length || !attLastMonth.value.length) return '→'
  if (rateThis.value > rateLast.value) return '↑'
  if (rateThis.value < rateLast.value) return '↓'
  return '→'
})
const trendColor = computed(() => trend.value === '↑' ? 'var(--g)' : trend.value === '↓' ? 'var(--r)' : 'var(--t3)')

const recentSkills = computed(() =>
  mySkills.value.filter(sk => sk.updated_at && new Date(sk.updated_at) > new Date(Date.now() - 14 * 86400000))
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 3)
)

function trainingName(tid) { return store.trainings.find(t => t.id === tid)?.name || '—' }
function myAttLabel(sid) {
  if (!d.value) return 'UNMARKED'
  const a = store.attendance.find(x => x.session_id === sid && x.designer_id === d.value.id)
  if (a?.is_present === true) return 'PRESENT'
  if (a?.is_present === 'late') return 'LATE'
  if (a?.is_present === false) return 'ABSENT'
  return 'UNMARKED'
}
function myAttClass(sid) {
  if (!d.value) return ''
  const a = store.attendance.find(x => x.session_id === sid && x.designer_id === d.value.id)
  if (a?.is_present === true) return 'att-present'
  if (a?.is_present === 'late') return 'att-late'
  if (a?.is_present === false) return 'att-absent'
  return 'att-unmarked'
}
function getSkillLevel(platform) { return mySkills.value.find(s => s.platform === platform)?.level || null }
</script>

<style scoped>
.des-home { padding-bottom: 20px }
.hero { position:relative; border:1px solid var(--bdr); margin-bottom:14px; overflow:hidden }
.hero-bg { position:absolute;inset:0;pointer-events:none }
.hero-inner { position:relative; display:flex; align-items:flex-start; justify-content:space-between; padding:20px 20px 16px; gap:16px }
.hero-greeting { font-size:11px; color:var(--t3); font-family:'JetBrains Mono',monospace; letter-spacing:.5px; margin-bottom:4px }
.hero-name { font-size:28px; font-weight:300; color:var(--t1); letter-spacing:-.5px; margin-bottom:10px; line-height:1.1 }
.hero-meta { display:flex; gap:6px; flex-wrap:wrap }
.hero-right { text-align:right; flex-shrink:0 }
.hero-rate { font-size:56px; font-weight:300; font-family:'JetBrains Mono',monospace; letter-spacing:-2px; line-height:1 }
.hero-pct { font-size:20px; color:var(--t3) }
.hero-rate-lbl { font-size:9px; color:var(--t4); font-family:'JetBrains Mono',monospace; margin-top:3px }
.standing-badge { display:inline-flex; align-items:center; gap:4px; margin-top:8px; padding:3px 10px; border:1px solid; font-size:9px; font-family:'JetBrains Mono',monospace; letter-spacing:.5px }
.streak-bar { position:relative; display:flex; align-items:center; gap:8px; padding:10px 20px; border-top:1px solid var(--bdr); background:rgba(251,191,36,.05) }
.streak-fire { font-size:16px }
.streak-count { font-size:12px; font-weight:500; color:var(--a); font-family:'JetBrains Mono',monospace }
.streak-sub { font-size:10px; color:var(--t4) }
.today-card { border:1px solid rgba(74,222,128,.3); background:rgba(74,222,128,.04); margin-bottom:14px; padding:14px 16px }
.today-hd { display:flex; align-items:center; gap:8px; margin-bottom:12px }
.today-dot { width:8px; height:8px; border-radius:50%; background:var(--g); animation:pulse 2s infinite; flex-shrink:0 }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.15)} }
.today-ttl { font-size:9px; font-family:'JetBrains Mono',monospace; letter-spacing:.8px; color:var(--g) }
.today-sess { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-top:1px solid rgba(74,222,128,.15) }
.today-name { font-size:14px; color:var(--t1) }
.today-status { font-size:9px; font-family:'JetBrains Mono',monospace; padding:2px 8px; letter-spacing:.5px }
.att-present { color:var(--g); border:1px solid rgba(74,222,128,.3); background:var(--g-bg) }
.att-late { color:var(--a); border:1px solid rgba(251,191,36,.3); background:var(--a-bg) }
.att-absent { color:var(--r); border:1px solid rgba(248,113,113,.3); background:var(--r-bg) }
.att-unmarked { color:var(--t4); border:1px solid var(--bdr) }
.qs-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--bdr); border:1px solid var(--bdr); margin-bottom:14px }
.qs-card { background:var(--bg); padding:14px 12px; text-align:center }
.qs-card.qs-alert { background:rgba(96,165,250,.05) }
.qs-val { font-size:26px; font-weight:300; font-family:'JetBrains Mono',monospace; color:var(--t1); line-height:1 }
.qs-lbl { font-size:8px; color:var(--t4); font-family:'JetBrains Mono',monospace; letter-spacing:.4px; margin-top:4px }
.trend-row { display:grid; grid-template-columns:1fr auto 1fr; gap:10px; align-items:center; margin-bottom:14px }
.trend-card { border:1px solid var(--bdr); padding:14px 16px; background:var(--bg) }
.trend-lbl { font-size:9px; color:var(--t4); font-family:'JetBrains Mono',monospace; letter-spacing:.6px; margin-bottom:4px }
.trend-val { font-size:28px; font-weight:300; font-family:'JetBrains Mono',monospace; color:var(--t1) }
.trend-sessions { font-size:9px; color:var(--t4); font-family:'JetBrains Mono',monospace; margin-top:3px }
.trend-arrow { font-size:28px; font-weight:300; text-align:center }
.section { margin-bottom:14px }
.section-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px }
.section-ttl { font-size:13px; color:var(--t1); font-weight:500 }
.section-sub { font-size:9px; color:var(--t4); font-family:'JetBrains Mono',monospace }
.awards-row { display:grid; grid-template-columns:repeat(3,1fr); gap:10px }
.award-card { border:1px solid var(--bdr); padding:16px 14px; text-align:center }
.award-medal { font-size:28px; margin-bottom:8px }
.award-platform { font-size:12px; color:var(--t1); margin-bottom:4px; font-weight:500 }
.award-level { font-size:9px; font-family:'JetBrains Mono',monospace; letter-spacing:.5px }
.skills-grid { display:flex; flex-wrap:wrap; gap:7px }
.skill-pill { display:flex; align-items:center; gap:6px; padding:6px 12px; border:1px solid var(--bdr); font-size:11px; color:var(--t4); transition:all .15s }
.skill-earned { font-weight:500 }
.skill-lvl { font-size:8px; font-family:'JetBrains Mono',monospace; letter-spacing:.4px }
.skill-none { font-size:10px; opacity:.4 }
.mu-list { border:1px solid var(--bdr) }
.mu-item { padding:12px 16px; border-bottom:1px solid var(--bdr-s); display:flex; align-items:center; justify-content:space-between }
.mu-training { font-size:13px; color:var(--t1) }
.mu-original { font-size:9px; color:var(--t4); font-family:'JetBrains Mono',monospace; margin-top:2px }
.mu-date { font-size:11px; font-family:'JetBrains Mono',monospace; color:var(--bl) }
@media(max-width:640px) {
  .qs-grid { grid-template-columns:repeat(2,1fr) }
  .awards-row { grid-template-columns:repeat(auto-fit,minmax(100px,1fr)) }
  .hero-rate { font-size:40px }
  .hero-name { font-size:22px }
}
</style>
