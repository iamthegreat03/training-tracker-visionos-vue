// patch-attendance-layout-filter.mjs
// node patch-attendance-layout-filter.mjs
// Fixes:
// 1. Attendance card layout — name on top row, heatmap full-width below, mark buttons top-right
// 2. Attendance filter — wire attFilter into teams computed correctly

import { readFileSync, writeFileSync } from 'fs'

const path = './src/views/AttendanceView.vue'
let src = readFileSync(path, 'utf8')

// ── Fix 1: Replace the designer card layout in the template ──────────────
// Old layout: horizontal flex (name | heatmap | mark buttons)
// New layout: top row (name + mark buttons), bottom row (heatmap full width)

src = src.replace(
`            <div v-for="d in team.members" :key="d.id" style="border:1px solid var(--bdr);background:var(--sur);transition:border-color .15s" @mouseover="$event.currentTarget.style.borderColor='var(--bdr-h)'" @mouseout="$event.currentTarget.style.borderColor='var(--bdr)'">
              <!-- TOP: name + schedule + mark buttons -->
              <div style="padding:12px 14px;display:flex;align-items:center;gap:10px">
                <div style="flex:1;min-width:0">
                  <div style="font-size:14px;color:var(--t1);cursor:pointer;font-weight:400;line-height:1.2" @click="openProfile(d.id)">{{ d.name }}</div>
                  <div style="font-size:10px;color:var(--t3);margin-top:4px;display:flex;gap:8px;align-items:center">
                    <span>{{ getScheduleStr(d.id) }}</span>
                    <span v-if="getRunRate(d.id) !== null" style="color:var(--g);font-family:'JetBrains Mono',monospace">{{ getRunRate(d.id) }}%</span>
                  </div>
                </div>
                
                <!-- Desktop Heatmap -->
                <div class="hm-wrap att-hm-mobile" style="flex:2;min-width:120px;display:none;justify-content:flex-end">
                   <div v-for="h in getHeatmap(d.id)" :key="h.s.id" class="hm-cell" :data-s="h.state" :style="h.extraStyle">
                     <div class="hm-tip">{{ fmtDs(h.s.session_date) }} — {{ h.tip }}</div>
                   </div>
                </div>

                <!-- Desktop Mark buttons -->
                <div class="att-mark-mobile" style="display:none">
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
            </div>`,

`            <div v-for="d in team.members" :key="d.id" style="border:1px solid var(--bdr);background:var(--sur);transition:border-color .15s" @mouseover="$event.currentTarget.style.borderColor='var(--bdr-h)'" @mouseout="$event.currentTarget.style.borderColor='var(--bdr)'">

              <!-- TOP ROW: name + schedule + run rate + mark buttons (right) -->
              <div style="padding:12px 14px;display:flex;align-items:flex-start;gap:10px">
                <div style="flex:1;min-width:0">
                  <div style="font-size:14px;color:var(--t1);cursor:pointer;font-weight:400;line-height:1.2" @click="openProfile(d.id)">{{ d.name }}</div>
                  <div style="font-size:10px;color:var(--t3);margin-top:4px;display:flex;gap:8px;align-items:center">
                    <span>· {{ getScheduleStr(d.id) }}</span>
                    <span v-if="getRunRate(d.id) !== null" style="color:var(--g);font-family:'JetBrains Mono',monospace">{{ getRunRate(d.id) }}%</span>
                  </div>
                  <!-- Notes -->
                  <div v-if="getAtt(d.id)?.notes" style="font-size:11px;color:var(--a);margin-top:5px">Note: {{ getAtt(d.id).notes }}</div>
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
              <div style="padding:6px 14px 12px;display:flex;flex-wrap:wrap;gap:3px;border-top:1px solid var(--bdr-s)">
                <div v-for="h in getHeatmap(d.id)" :key="h.s.id" class="hm-cell" :data-s="h.state" :style="h.extraStyle">
                  <div class="hm-tip">{{ fmtDs(h.s.session_date) }} — {{ h.tip }}</div>
                </div>
                <div v-if="getHeatmap(d.id).length" style="width:100%;font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:5px">
                  {{ getHeatmap(d.id).filter(h => h.state === 'p' || h.state === 'l').length }} attended of {{ getHeatmap(d.id).filter(h => h.state && h.state !== 'x').length }} marked sessions
                </div>
              </div>
            </div>`
)

// ── Fix 2: Replace teams computed with one that correctly applies attFilter ──
src = src.replace(
`// Filtered teams based on attFilter
const teams = computed(() => {`,
`const teams = computed(() => {`
)

// Now replace the full teams computed body with correct filter logic
src = src.replace(
`  const grouped = {}
  enrolledDes.value.forEach(d => {
    const key = d.team || 'Unassigned'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(d)
  })
  return Object.entries(grouped).map(([name, members]) => ({
    name,
    members: members.filter(d => {
      if (attFilter.value === 'all') return true
      const a = getAtt(d.id)
      const mu = store.makeups.find(x => x.original_session_id === selS.value && x.designer_id === d.id)
      if (attFilter.value === 'present') return a?.is_present === true || mu?.is_attended === true
      if (attFilter.value === 'late') return a?.is_present === 'late'
      if (attFilter.value === 'absent') return a?.is_present === false
      if (attFilter.value === 'unmarked') return isScheduledDes(d.id) && (!a || a.is_present === null) && !mu
      return true
    })
  })).filter(t => t.members.length > 0)
})`,
`  const grouped = {}
  enrolledDes.value.forEach(d => {
    const key = d.team || 'Unassigned'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(d)
  })
  return Object.entries(grouped).map(([name, members]) => ({
    name,
    members: members.filter(d => {
      if (attFilter.value === 'all') return true
      const a = store.attendance.find(x => x.session_id === selS.value && x.designer_id === d.id)
      const mu = store.makeups.find(x => x.original_session_id === selS.value && x.designer_id === d.id)
      if (attFilter.value === 'present') return normAtt(a?.is_present) === true || mu?.is_attended === true
      if (attFilter.value === 'late') return normAtt(a?.is_present) === 'late'
      if (attFilter.value === 'absent') return normAtt(a?.is_present) === false
      if (attFilter.value === 'unmarked') return isScheduledDes(d.id) && (!a || a.is_present === null) && !mu
      return true
    })
  })).filter(t => t.members.length > 0)
})`
)

writeFileSync(path, src)
console.log('✓ patch-attendance-layout-filter — layout and filter both fixed')
console.log('\nNext steps:')
console.log('  git add src/views/AttendanceView.vue')
console.log('  git commit -m "fix(attendance): card layout matches legacy, filter working"')
console.log('  git push')
