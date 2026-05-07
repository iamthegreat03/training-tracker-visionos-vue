<template>
  <div>
    <!-- Header -->
    <div class="sh">
      <div>
        <div class="sh-t">Skill Set</div>
        <div class="sh-s">Platform expertise · {{ store.designers.length }} designers · {{ store.designerSkills.length }} skills mapped</div>
      </div>
      <button class="btn btn-g" @click="exportCSV">EXPORT CSV</button>
    </div>

    <!-- No Skills Alert -->
    <div v-if="noSkills.length" style="border:1px solid rgba(251,191,36,.25);background:var(--a-bg);padding:10px 16px;margin-bottom:16px;font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--a)">
      ⚠ {{ noSkills.length }} DESIGNER{{ noSkills.length > 1 ? 'S' : '' }} WITH NO SKILLS SET: {{ noSkills.map(d => d.name).join(', ') }}
    </div>

    <!-- Distribution Panels -->
    <div style="display:grid;grid-template-columns:1fr 2fr;gap:1px;background:var(--bdr);border:1px solid var(--bdr);margin-bottom:20px">
      <!-- Overall -->
      <div style="background:var(--bg);padding:18px 20px">
        <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:14px">OVERALL DISTRIBUTION</div>
        <div style="margin-bottom:8px">
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">EXPERT</div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1;height:6px;background:var(--bdr);overflow:hidden">
              <div style="height:100%;background:var(--g);transition:width .5s" :style="{ width: pct(expCount, totalSkills) + '%' }"></div>
            </div>
            <span style="font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--g);min-width:32px;text-align:right">{{ pct(expCount, totalSkills) }}%</span>
            <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;min-width:20px">{{ expCount }}</span>
          </div>
        </div>
        <div style="margin-bottom:8px">
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">ADVANCED</div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1;height:6px;background:var(--bdr);overflow:hidden">
              <div style="height:100%;background:var(--a);transition:width .5s" :style="{ width: pct(advCount, totalSkills) + '%' }"></div>
            </div>
            <span style="font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--a);min-width:32px;text-align:right">{{ pct(advCount, totalSkills) }}%</span>
            <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;min-width:20px">{{ advCount }}</span>
          </div>
        </div>
        <div>
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">INTERMEDIATE</div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1;height:6px;background:var(--bdr);overflow:hidden">
              <div style="height:100%;background:var(--bl);transition:width .5s" :style="{ width: pct(intCount, totalSkills) + '%' }"></div>
            </div>
            <span style="font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--bl);min-width:32px;text-align:right">{{ pct(intCount, totalSkills) }}%</span>
            <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;min-width:20px">{{ intCount }}</span>
          </div>
        </div>
      </div>

      <!-- Per Platform Desktop -->
      <div style="background:var(--bg);padding:18px 20px" class="platdist-desktop">
        <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:14px">PER PLATFORM DISTRIBUTION</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(120px, 1fr));gap:12px">
          <div v-for="pd in platDist" :key="pd.pl">
            <div style="font-size:9px;color:var(--t2);font-family:'JetBrains Mono',monospace;margin-bottom:8px;letter-spacing:.3px">{{ pd.pl.toUpperCase() }}</div>
            <div style="margin-bottom:4px">
              <div style="font-size:8px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:2px">EXP {{ pct(pd.e, pd.tot) }}%</div>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;height:6px;background:var(--bdr);overflow:hidden"><div style="height:100%;background:var(--g);transition:width .5s" :style="{ width: pct(pd.e, pd.tot) + '%' }"></div></div>
                <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;min-width:20px">{{ pd.e }}</span>
              </div>
            </div>
            <div style="margin-bottom:4px">
              <div style="font-size:8px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:2px">ADV {{ pct(pd.a, pd.tot) }}%</div>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;height:6px;background:var(--bdr);overflow:hidden"><div style="height:100%;background:var(--a);transition:width .5s" :style="{ width: pct(pd.a, pd.tot) + '%' }"></div></div>
                <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;min-width:20px">{{ pd.a }}</span>
              </div>
            </div>
            <div>
              <div style="font-size:8px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:2px">INT {{ pct(pd.i, pd.tot) }}%</div>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;height:6px;background:var(--bdr);overflow:hidden"><div style="height:100%;background:var(--bl);transition:width .5s" :style="{ width: pct(pd.i, pd.tot) + '%' }"></div></div>
                <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;min-width:20px">{{ pd.i }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div style="display:flex;gap:16px;margin-bottom:14px;align-items:center;flex-wrap:wrap">
      <div style="display:flex;gap:6px;align-items:center">
        <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">PLATFORM:</span>
        <button v-for="pl in ['All', ...activePlatforms]" :key="pl" class="chip" :class="{ on: platFilter === pl }" @click="platFilter = pl">
          {{ pl === 'All' ? 'ALL' : pl.slice(0, 3).toUpperCase() }}
        </button>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">LEVEL:</span>
        <button v-for="l in ['All', ...LEVELS]" :key="l" class="chip" :class="{ on: lvlFilter === l }" @click="lvlFilter = l">
          {{ l === 'All' ? 'ALL' : LEVEL_SHORT[l] }}
        </button>
      </div>
      <button v-if="skSort" class="chip on" @click="skSort = null">SORTED BY {{ skSort.slice(0, 3).toUpperCase() }} ✕</button>
      
      <div style="margin-left:auto;display:flex;gap:10px;align-items:center">
        <div v-for="l in LEVELS" :key="l" style="display:flex;align-items:center;gap:5px;font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--t3)">
          <div style="width:14px;height:6px" :style="{ background: LEVEL_COLOR[l] }"></div>{{ l.toUpperCase() }}
        </div>
        <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">CLICK CELL TO EDIT · CLICK HEADER TO SORT</span>
      </div>
    </div>

    <!-- Matrix -->
    <div class="card" style="margin-bottom:20px">
      <div class="tw">
        <table>
          <thead>
            <tr>
              <th style="min-width:160px">Designer</th>
              <th>Team</th>
              <th v-for="pl in showPlatforms" :key="pl" style="text-align:center;min-width:100px;cursor:pointer" class="sk-platform-col">
                <div style="display:flex;align-items:center;justify-content:center;gap:5px">
                  <span @click="skSort = skSort === pl ? null : pl" style="cursor:pointer">{{ pl.toUpperCase() }} {{ skSort === pl ? '↓' : '' }}</span>
                  <button v-if="!PLATFORMS.includes(pl)" @click.stop="confirmDeletePlatform(pl)" :title="`Delete entire ${pl} skill column`" style="width:14px;height:14px;border:1px solid rgba(248,113,113,.4);background:var(--r-bg);color:var(--r);font-size:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;transition:all .15s;flex-shrink:0" onmouseover="this.style.background='var(--r)';this.style.color='#fff'" onmouseout="this.style.background='var(--r-bg)';this.style.color='var(--r)'">✕</button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="[team, members] in Object.entries(regrouped).sort((a,b) => a[0].localeCompare(b[0]))" :key="team">
              <tr>
                <td :colspan="showPlatforms.length + 2" style="padding:5px 14px;background:var(--bg2);font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:.8px;color:var(--t4)">TEAM {{ team.toUpperCase() }}</td>
              </tr>
              <tr v-for="d in members" :key="d.id" :style="{ background: hasAnySkill(d.id) ? '' : 'rgba(248,113,113,.03)' }">
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:20px;height:20px;background:var(--sur-h);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:8px;font-family:'JetBrains Mono',monospace;color:var(--t3)">{{ init(d.name) }}</div>
                    <span style="font-size:13px" :style="{ color: hasAnySkill(d.id) ? 'var(--t1)' : 'var(--r)' }">{{ d.name }}</span>
                    <span v-if="!hasAnySkill(d.id)" style="font-size:8px;color:var(--r);font-family:'JetBrains Mono',monospace;border:1px solid rgba(248,113,113,.3);padding:1px 4px">GAP</span>
                  </div>
                </td>
                <td><span class="tag">{{ d.team || '—' }}</span></td>
                <td v-for="pl in showPlatforms" :key="pl" style="text-align:center;padding:6px">
                  <button @click="openSkillEdit(d, pl)"
                    style="width:76px;padding:5px 6px;border:1px solid var(--bdr);background:transparent;color:var(--t4);font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:.6px;cursor:pointer;transition:all .15s"
                    :style="skillStyle(d.id, pl)"
                    onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'" :title="skillLevel(d.id, pl) ? 'Edit ' + skillLevel(d.id, pl) : 'Set skill'">
                    {{ skillShort(d.id, pl) }}
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Designer Skill Gap (Discussion trainings) -->
    <template v-if="dsgTopics.length">
      <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:10px">DESIGNER SKILL GAP — Discussion training completions</div>
      <div class="card" style="margin-bottom:20px">
        <div class="tw">
          <table>
            <thead>
              <tr>
                <th style="min-width:160px">Designer</th>
                <th>Team</th>
                <th v-for="tp in dsgTopics" :key="tp" style="text-align:center;min-width:110px">{{ tp.replace(/^DSG: /, '').toUpperCase() }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="[team, members] in Object.entries(groupedByTeam).sort((a,b) => a[0].localeCompare(b[0]))" :key="team">
                <tr><td :colspan="dsgTopics.length + 2" style="padding:5px 14px;background:var(--bg2);font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:.8px;color:var(--t4)">TEAM {{ team.toUpperCase() }}</td></tr>
                <tr v-for="d in members" :key="d.id">
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <div style="width:20px;height:20px;background:var(--sur-h);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:8px;font-family:'JetBrains Mono',monospace;color:var(--t3)">{{ init(d.name) }}</div>
                      <span style="font-size:13px;color:var(--t1)">{{ d.name }}</span>
                    </div>
                  </td>
                  <td><span class="tag">{{ d.team || '—' }}</span></td>
                  <td v-for="tp in dsgTopics" :key="tp" style="text-align:center;padding:8px">
                    <span style="font-size:13px" :style="{ color: hasSkill(d.id, tp) ? 'var(--g)' : 'var(--t4)' }">{{ hasSkill(d.id, tp) ? '✓' : '—' }}</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Team Coverage -->
    <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:10px">TEAM SKILL COVERAGE — % of team with any level per platform</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1px;background:var(--bdr);border:1px solid var(--bdr)">
      <div v-for="tc in teamCoverage" :key="tc.team" style="background:var(--bg);padding:16px 18px">
        <div style="font-size:13px;color:var(--t1);margin-bottom:12px">{{ tc.team }} <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">{{ tc.count }} MEMBERS</span></div>
        <div v-for="pp in tc.platforms" :key="pp.pl" style="margin-bottom:7px">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px">
            <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">{{ pp.pl.slice(0, 3).toUpperCase() }}</span>
            <span style="font-size:9px;font-family:'JetBrains Mono',monospace" :style="{ color: pp.pct >= 80 ? 'var(--g)' : pp.pct >= 50 ? 'var(--a)' : 'var(--r)' }">{{ pp.pct }}%</span>
          </div>
          <div style="height:3px;background:var(--bdr);overflow:hidden"><div style="height:100%;transition:width .5s" :style="{ width: pp.pct + '%', background: pp.pct >= 80 ? 'var(--g)' : pp.pct >= 50 ? 'var(--a)' : 'var(--r)' }"></div></div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    
    <!-- Edit Skill -->
    <AppModal v-model="showSkillEdit" :title="`SKILL // ${selDes?.name?.toUpperCase()} // ${selPlat?.toUpperCase()}`">
      <div style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:16px">Set the current proficiency level for this designer on this platform.</div>
      <div class="fg">
        <label>Level</label>
        <select v-model="editLevel" class="sel">
          <option value="">— Not Set —</option>
          <option v-for="l in LEVELS" :key="l" :value="l">{{ l }}</option>
        </select>
      </div>
      <div class="fg">
        <label>Source / Note</label>
        <input v-model="editSource" class="inp" placeholder="manual / training name…"/>
      </div>
      <template #footer>
        <button class="btn btn-g" @click="showSkillEdit = false">CANCEL</button>
        <button class="btn btn-d" v-if="hasExistingSkill" @click="showSkillEdit = false; showSkillDelete = true">DELETE</button>
        <button class="btn btn-p" :disabled="saving" @click="saveSkill">
          <span v-if="saving" class="spin"></span><span v-else>SAVE</span>
        </button>
      </template>
    </AppModal>

    <!-- Delete Skill Confirmation -->
    <AppModal v-model="showSkillDelete" :title="`DELETE SKILL // ${selPlat?.toUpperCase()}`">
      <div style="text-align:center;padding:12px 0">
        <div style="font-size:32px;margin-bottom:14px">🗑</div>
        <div style="font-size:14px;color:var(--t1);font-weight:500;margin-bottom:8px">Permanently delete <strong>{{ selPlat }}</strong> skill for <strong>{{ selDes?.name }}</strong>?</div>
        <div style="font-size:11px;color:var(--r);font-family:'JetBrains Mono',monospace;margin-top:10px">This cannot be undone. The skill will be removed from all stats and distributions.</div>
      </div>
      <template #footer>
        <button class="btn btn-g" @click="showSkillDelete = false; showSkillEdit = true">← GO BACK</button>
        <button class="btn btn-d" :disabled="saving" @click="deleteSkill">YES, DELETE PERMANENTLY</button>
      </template>
    </AppModal>

    <!-- Delete Platform Confirmation -->
    <AppModal v-model="showPlatDelete" :title="`DELETE PLATFORM // ${selPlat?.toUpperCase()}`">
      <div style="text-align:center;padding:12px 0">
        <div style="font-size:36px;margin-bottom:14px">⚠️</div>
        <div style="font-size:15px;color:var(--t1);font-weight:500;margin-bottom:10px">Delete entire <strong>{{ selPlat }}</strong> skill?</div>
        <div style="font-size:12px;color:var(--t3);margin-bottom:16px">This will permanently remove <strong style="color:var(--r)">{{ platSkillCount }} skill record{{ platSkillCount !== 1 ? 's' : '' }}</strong> across all designers.</div>
        <div style="font-size:10px;color:var(--r);font-family:'JetBrains Mono',monospace;background:var(--r-bg);border:1px solid rgba(248,113,113,.25);padding:10px 14px">This cannot be undone. The column will disappear from the Skill Set tab and all designer profiles.</div>
      </div>
      <template #footer>
        <button class="btn btn-g" @click="showPlatDelete = false">CANCEL</button>
        <button class="btn btn-d" :disabled="saving" @click="deletePlatform">YES, DELETE ALL {{ platSkillCount }} RECORDS</button>
      </template>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { db } from '@/lib/supabase'
import { pct, init, PLATFORMS, LEVELS, LEVEL_SHORT, LEVEL_COLOR } from '@/lib/utils'
import AppModal from '@/components/AppModal.vue'

const store = useAppStore()

const platFilter = ref('All')
const lvlFilter = ref('All')
const skSort = ref(null)

const activePlatforms = computed(() => {
  return [...new Set([
    ...PLATFORMS,
    ...store.designerSkills.map(s => s.platform),
    ...store.trainings.map(t => t.platform).filter(Boolean)
  ])].filter(p => !p.startsWith('DSG: ')).sort()
})

const totalSkills = computed(() => store.designerSkills.filter(s => !s.platform.startsWith('DSG: ')).length)
const intCount = computed(() => store.designerSkills.filter(s => !s.platform.startsWith('DSG: ') && s.level === 'Intermediate').length)
const advCount = computed(() => store.designerSkills.filter(s => !s.platform.startsWith('DSG: ') && s.level === 'Advanced').length)
const expCount = computed(() => store.designerSkills.filter(s => !s.platform.startsWith('DSG: ') && s.level === 'Expert').length)

const platDist = computed(() => {
  return activePlatforms.value.map(pl => {
    const all = store.designerSkills.filter(s => s.platform === pl)
    const i = all.filter(s => s.level === 'Intermediate').length
    const a = all.filter(s => s.level === 'Advanced').length
    const e = all.filter(s => s.level === 'Expert').length
    return { pl, i, a, e, tot: store.designers.length, total: all.length }
  })
})

const teamCoverage = computed(() => {
  return store.teams.map(t => {
    const mems = store.designers.filter(d => d.team === t.name)
    return {
      team: t.name,
      count: mems.length,
      platforms: activePlatforms.value.map(pl => {
        const withSkill = mems.filter(d => store.designerSkills.some(s => s.designer_id === d.id && s.platform === pl)).length
        return { pl, pct: pct(withSkill, mems.length), count: withSkill }
      })
    }
  }).filter(t => t.count > 0)
})

const showPlatforms = computed(() => platFilter.value === 'All' ? activePlatforms.value : [platFilter.value])

const filteredDesigners = computed(() => {
  let all = [...store.designers]
  if (lvlFilter.value !== 'All') {
    all = all.filter(d => showPlatforms.value.some(pl => 
      store.designerSkills.find(s => s.designer_id === d.id && s.platform === pl && s.level === lvlFilter.value)
    ))
  }
  if (skSort.value) {
    all.sort((a, b) => {
      const la = store.designerSkills.find(s => s.designer_id === a.id && s.platform === skSort.value)?.level || ''
      const lb = store.designerSkills.find(s => s.designer_id === b.id && s.platform === skSort.value)?.level || ''
      const order = { Expert: 3, Advanced: 2, Intermediate: 1, '': 0 }
      return (order[lb] || 0) - (order[la] || 0)
    })
  }
  return all
})

const regrouped = computed(() => {
  const g = {}
  filteredDesigners.value.forEach(d => {
    if (!g[d.team]) g[d.team] = []
    g[d.team].push(d)
  })
  return g
})

const noSkills = computed(() => store.designers.filter(d => !store.designerSkills.some(s => s.designer_id === d.id)))

function hasAnySkill(did) {
  return store.designerSkills.some(s => s.designer_id === did)
}

function skillLevel(did, pl) {
  return store.designerSkills.find(s => s.designer_id === did && s.platform === pl)?.level || null
}

function skillShort(did, pl) {
  const l = skillLevel(did, pl)
  return l ? LEVEL_SHORT[l] : '—'
}

function skillStyle(did, pl) {
  const l = skillLevel(did, pl)
  if (!l) return {}
  return {
    borderColor: LEVEL_COLOR[l],
    background: LEVEL_COLOR[l] + '18',
    color: LEVEL_COLOR[l]
  }
}

// DSG Topic handling
const dsgTopics = computed(() => {
  return [...new Set(store.designerSkills.filter(s => s.platform.startsWith('DSG: ')).map(s => s.platform))].sort()
})

const groupedByTeam = computed(() => {
  const g = {}
  store.designers.forEach(d => {
    if (!g[d.team]) g[d.team] = []
    g[d.team].push(d)
  })
  return g
})

function hasSkill(did, tp) {
  return store.designerSkills.some(s => s.designer_id === did && s.platform === tp)
}

// ── Modals ────────────────────────────────────────────────────────
const showSkillEdit = ref(false)
const selDes = ref(null)
const selPlat = ref(null)
const editLevel = ref('')
const editSource = ref('manual')
const saving = ref(false)

const hasExistingSkill = computed(() => !!skillLevel(selDes.value?.id, selPlat.value))

function openSkillEdit(d, pl) {
  selDes.value = d
  selPlat.value = pl
  const s = store.designerSkills.find(x => x.designer_id === d.id && x.platform === pl)
  editLevel.value = s?.level || ''
  editSource.value = s?.source || 'manual'
  showSkillEdit.value = true
}

async function saveSkill() {
  if (!editLevel.value) {
    if (hasExistingSkill.value) {
      showSkillEdit.value = false
      showSkillDelete.value = true
      return
    }
    showSkillEdit.value = false
    return
  }
  saving.value = true
  const { error } = await db.from('designer_skills').upsert({
    designer_id: selDes.value.id,
    platform: selPlat.value,
    level: editLevel.value,
    source: editSource.value,
    updated_at: new Date().toISOString()
  }, { onConflict: 'designer_id,platform' })
  if (!error) {
    showSkillEdit.value = false
    await store.loadAll()
  }
  saving.value = false
}

const showSkillDelete = ref(false)

async function deleteSkill() {
  saving.value = true
  const { error } = await db.from('designer_skills')
    .delete()
    .eq('designer_id', selDes.value.id)
    .eq('platform', selPlat.value)
  if (!error) {
    showSkillDelete.value = false
    await store.loadAll()
  }
  saving.value = false
}

const showPlatDelete = ref(false)
const platSkillCount = computed(() => store.designerSkills.filter(s => s.platform === selPlat.value).length)

function confirmDeletePlatform(pl) {
  selPlat.value = pl
  showPlatDelete.value = true
}

async function deletePlatform() {
  saving.value = true
  const { error } = await db.from('designer_skills').delete().eq('platform', selPlat.value)
  if (!error) {
    if (platFilter.value === selPlat.value) platFilter.value = 'All'
    if (skSort.value === selPlat.value) skSort.value = null
    showPlatDelete.value = false
    await store.loadAll()
  }
  saving.value = false
}

function exportCSV() {
  const headers = ['Designer', 'Team', 'Tier', ...activePlatforms.value]
  const rows = store.designers.map(d => {
    const cells = [d.name, d.team || '', d.rank || '']
    activePlatforms.value.forEach(pl => {
      const s = store.designerSkills.find(x => x.designer_id === d.id && x.platform === pl)
      cells.push(s?.level || '—')
    })
    return cells
  })
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  a.download = 'skillset.csv'
  a.click()
}
</script>
