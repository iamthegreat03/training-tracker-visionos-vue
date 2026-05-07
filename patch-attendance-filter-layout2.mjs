// patch-attendance-filter-layout2.mjs
// node patch-attendance-filter-layout2.mjs

import { readFileSync, writeFileSync } from 'fs'

const path = './src/views/AttendanceView.vue'
let src = readFileSync(path, 'utf8')

// ── Fix 1: teams computed — apply attFilter correctly ─────────────────────
// The existing teams computed groups designers correctly but doesn't filter.
// Replace the return line to inject the filter on members.

src = src.replace(
`   return Object.keys(groups).sort().map(k => ({ name: k, members: groups[k] }))
})`,
`   return Object.keys(groups).sort().map(k => ({
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
})`
)

// ── Fix 2: heatmap section bg — add var(--bg2) background matching legacy ──
src = src.replace(
`              <!-- BOTTOM ROW: heatmap full width -->
              <div style="padding:6px 14px 12px;display:flex;flex-wrap:wrap;gap:3px;border-top:1px solid var(--bdr-s)">`,
`              <!-- BOTTOM ROW: heatmap full width -->
              <div style="padding:6px 14px 12px;display:flex;flex-wrap:wrap;gap:3px;border-top:1px solid var(--bdr-s);background:var(--bg2)">`
)

// ── Fix 3: move note inline with "attended of marked" text ────────────────
// Remove the standalone note div above heatmap
src = src.replace(
`                  <!-- Notes -->
                  <div v-if="getAtt(d.id)?.notes" style="font-size:11px;color:var(--a);margin-top:5px">Note: {{ getAtt(d.id).notes }}</div>`,
``
)

// Add note inline with the attended/marked count
src = src.replace(
`                <div v-if="getHeatmap(d.id).length" style="width:100%;font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:5px">
                  {{ getHeatmap(d.id).filter(h => h.state === 'p' || h.state === 'l').length }} attended of {{ getHeatmap(d.id).filter(h => h.state && h.state !== 'x').length }} marked sessions
                </div>`,
`                <div v-if="getHeatmap(d.id).length" style="width:100%;font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:5px">
                  {{ getHeatmap(d.id).filter(h => h.state === 'p' || h.state === 'l').length }} attended of {{ getHeatmap(d.id).filter(h => h.state && h.state !== 'x').length }} marked sessions<span v-if="getAtt(d.id)?.notes" style="color:var(--a)"> · Note: {{ getAtt(d.id).notes }}</span>
                </div>`
)

// ── Fix 4: proof URL input — center it ──────────────────────────────────
// Just change the proof input container to center-justify
src = src.replace(
`          <!-- Proof URL inline input -->
          <div style="display:flex;align-items:center;gap:7px;flex-shrink:0">`,
`          <!-- Proof URL inline input -->
          <div style="display:flex;align-items:center;justify-content:center;gap:7px;flex:1">`
)

// Move filter chips to their own row below by changing the c-hd to column layout
src = src.replace(
`        <div class="c-hd" style="flex-wrap:wrap;gap:10px">`,
`        <div style="padding:12px 18px;border-bottom:1px solid var(--bdr);display:flex;flex-direction:column;gap:10px">`
)

writeFileSync(path, src)

// Verify the file is valid by checking key strings exist
const result = readFileSync(path, 'utf8')
const checks = [
  ['attFilter filter logic', "attFilter.value === 'present'"],
  ['heatmap bg2', 'background:var(--bg2)'],
  ['note inline', 'Note: {{ getAtt(d.id).notes }}'],
]
let allGood = true
for (const [label, check] of checks) {
  if (result.includes(check)) {
    console.log(`✓ ${label}`)
  } else {
    console.log(`✗ FAILED: ${label}`)
    allGood = false
  }
}

if (allGood) {
  console.log('\n✓ All fixes applied successfully')
  console.log('  git add src/views/AttendanceView.vue')
  console.log('  git commit -m "fix(attendance): filter logic, heatmap bg, note position, proof url center"')
  console.log('  git push')
} else {
  console.log('\n⚠ Some fixes failed — check output above')
}
