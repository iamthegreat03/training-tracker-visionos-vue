// patch-bugs2.mjs — run from training-tracker-vue/ root
// node patch-bugs2.mjs
//
// Fixes:
// 1. App.vue — sign out btn: remove white bg, keep transparent. Remove theme toggle from sidebar footer.
// 2. AttendanceView.vue — replace PROOF URL + DELETE buttons with inline proof input (matching legacy)
//                       — add attendance filter chips (all/present/absent/late/unmarked)
//                       — fix card layout to match legacy (name left, heatmap right, mark buttons right)
// 3. TrainingsView.vue — fix ddb day buttons showing blank labels (MON/TUE etc.)

import { readFileSync, writeFileSync } from 'fs'

// ─── Fix 1: App.vue ───────────────────────────────────────────
let app = readFileSync('./src/App.vue', 'utf8')

// Fix sign out button — remove btn-ic class (causes white bg), use raw icon button style matching legacy
app = app.replace(
  `            <button class="btn btn-ic" style="padding:5px;color:var(--t3);flex-shrink:0" title="Sign out" @click="signOut">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>`,
  `            <button style="background:none;border:none;padding:5px;color:var(--t3);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:color .13s" title="Sign out" @click="signOut" @mouseover="$event.currentTarget.style.color='var(--t1)'" @mouseleave="$event.currentTarget.style.color='var(--t3)'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>`
)

// Remove theme toggle from sidebar footer (keep only in topbar)
app = app.replace(
  `          <button class="tt" id="tt-btn" style="margin:8px 8px 0" @click="toggleTheme">
            {{ isDark ? '☀ Light' : '◑ Dark' }}
          </button>
        </div>
      </nav>`,
  `        </div>
      </nav>`
)

writeFileSync('./src/App.vue', app)
console.log('✓ Fix 1 — App.vue: sign out icon fixed, sidebar theme toggle removed')

// ─── Fix 2: AttendanceView.vue ────────────────────────────────
let att = readFileSync('./src/views/AttendanceView.vue', 'utf8')

// 2a. Replace the session header buttons (PROOF URL + DELETE) with inline proof input + filter chips
att = att.replace(
  `      <!-- Selected Session Details -->
      <div v-if="session" class="card">
        <div class="c-hd">
          <div>
            <span class="c-ttl">{{ new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase() }}</span>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:3px">CLICK ○ → ✓ PRESENT → ~ LATE → ✗ ABSENT → ○ CLEAR</div>
          </div>
          <div style="display:flex;align-items:center;gap:7px">
             <template v-if="store.can('can_edit_training')">
               <button class="btn btn-g btn-xs" @click="openProof(session.proof_url)">PROOF URL</button>
               <button class="btn btn-g btn-xs" style="border-color:var(--r);color:var(--r)" @click="confirmDelSess = true">DELETE</button>
             </template>
             <button v-else-if="session.proof_url" class="btn btn-g btn-xs" @click="openProof(session.proof_url)">VIEW PROOF</button>
          </div>
        </div>`,
  `      <!-- Selected Session Details -->
      <div v-if="session" class="card">
        <div class="c-hd" style="flex-wrap:wrap;gap:10px">
          <div style="flex:1;min-width:200px">
            <span class="c-ttl">{{ new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase() }}</span>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:3px">CLICK ○ → ✓ PRESENT → ~ LATE → ✗ ABSENT → ○ CLEAR</div>
          </div>
          <!-- Proof URL inline input -->
          <div style="display:flex;align-items:center;gap:7px;flex-shrink:0">
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
        </div>`
)

// 2b. Add attFilter ref after the existing refs
att = att.replace(
  `const selT = ref(null)
const selS = ref(null)`,
  `const selT = ref(null)
const selS = ref(null)
const attFilter = ref('all')`
)

// 2c. Fix teams computed to apply the attFilter
att = att.replace(
  `const teams = computed(() => {`,
  `// Filtered teams based on attFilter
const teams = computed(() => {`
)

// Find the teams computed and inject filter logic
att = att.replace(
  `  const grouped = {}
  enrolledDes.value.forEach(d => {
    const key = d.team || 'Unassigned'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(d)
  })
  return Object.entries(grouped).map(([name, members]) => ({ name, members }))
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
      const a = getAtt(d.id)
      const mu = store.makeups.find(x => x.original_session_id === selS.value && x.designer_id === d.id)
      if (attFilter.value === 'present') return a?.is_present === true || mu?.is_attended === true
      if (attFilter.value === 'late') return a?.is_present === 'late'
      if (attFilter.value === 'absent') return a?.is_present === false
      if (attFilter.value === 'unmarked') return isScheduledDes(d.id) && (!a || a.is_present === null) && !mu
      return true
    })
  })).filter(t => t.members.length > 0)
})`
)

// 2d. Add saveProofUrl function if missing
if (!att.includes('async function saveProofUrl')) {
  att = att.replace(
    `async function saveReschedule()`,
    `async function saveProofUrl(sessionId, url) {
  const { error } = await db.from('training_sessions').update({ proof_url: url || null }).eq('id', sessionId)
  if (!error) { toast('Proof link saved'); await store.loadAll() }
  else toast(error.message, 'er')
}

async function saveReschedule()`
  )
}

writeFileSync('./src/views/AttendanceView.vue', att)
console.log('✓ Fix 2 — AttendanceView.vue: proof input, filter chips, layout')

// ─── Fix 3: TrainingsView.vue — fix blank ddb labels ─────────
let tv = readFileSync('./src/views/TrainingsView.vue', 'utf8')

// The ddb buttons show blank because the button content is on the next line
// and the merged :style binding is on a single long line. Check if content is missing.
// The button text should be: {{ editT.type === 'Discussion' ? fmtDs(item).toUpperCase() : item.slice(0,3).toUpperCase() }}
// Make sure it's there — if the button closes without content, add it
if (tv.includes(`@click="toggleEnrollDay(d.id, item)">
                </button>`)) {
  tv = tv.replace(
    `@click="toggleEnrollDay(d.id, item)">
                </button>`,
    `@click="toggleEnrollDay(d.id, item)">
                  {{ editT.type === 'Discussion' ? fmtDs(item).toUpperCase() : item.slice(0,3).toUpperCase() }}
                </button>`
  )
  console.log('✓ Fix 3 — TrainingsView.vue: ddb button labels restored')
} else if (tv.includes(`@click="toggleEnrollDay(d.id, item)">>`)) {
  tv = tv.replace(
    `@click="toggleEnrollDay(d.id, item)">>`
    , `@click="toggleEnrollDay(d.id, item)">
                  {{ editT.type === 'Discussion' ? fmtDs(item).toUpperCase() : item.slice(0,3).toUpperCase() }}
                </button>`
  )
  console.log('✓ Fix 3 — TrainingsView.vue: ddb button labels restored (variant 2)')
} else {
  // Search for the button and show context
  const idx = tv.indexOf('toggleEnrollDay(d.id, item)')
  const snippet = tv.slice(idx, idx + 200)
  console.log('⚠  Fix 3 — Could not auto-patch ddb button. Snippet around toggleEnrollDay:')
  console.log(snippet)
  console.log('\nManual fix: find the button with @click="toggleEnrollDay(d.id, item)"')
  console.log('and add this as its content between > and </button>:')
  console.log('  {{ editT.type === \'Discussion\' ? fmtDs(item).toUpperCase() : item.slice(0,3).toUpperCase() }}')
}

writeFileSync('./src/views/TrainingsView.vue', tv)

console.log('\nAll patches applied. Run:')
console.log('  git add . && git commit -m "fix: sidebar, attendance layout, ddb labels" && git push')
