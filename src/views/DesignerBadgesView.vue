<template>
  <div>
    <div class="sh">
      <div>
        <div class="sh-t">Badges</div>
        <div class="sh-s">Your earned skills and certifications</div>
      </div>
    </div>

    <div v-if="!d" class="empty"><div class="ec">— PROFILE NOT FOUND —</div></div>
    <template v-else>

      <!-- Summary -->
      <div class="sg" style="grid-template-columns:repeat(auto-fit, minmax(100px, 1fr));margin-bottom:24px">
        <div class="st">
          <div class="st-l">Total Skills</div>
          <div class="st-v" style="color:var(--g)">{{ mySkills.length }}</div>
        </div>
        <div class="st">
          <div class="st-l">Expert</div>
          <div class="st-v" style="color:var(--g)">{{ byLevel('Expert') }}</div>
        </div>
        <div class="st">
          <div class="st-l">Advanced</div>
          <div class="st-v" style="color:var(--a)">{{ byLevel('Advanced') }}</div>
        </div>
      </div>

      <!-- Earned Skill Badges -->
      <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:12px">
        EARNED SKILL BADGES — {{ mySkills.length }}
      </div>

      <div v-if="mySkills.length === 0" class="empty" style="margin-bottom:24px">
        <div class="ec">— NO SKILLS EARNED YET —</div>
      </div>

      <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:28px">
        <div v-for="sk in sortedSkills" :key="sk.platform"
          style="border:1px solid var(--bdr);padding:18px 20px;position:relative;overflow:hidden"
          :style="{ borderColor: LEVEL_COLOR[sk.level] + '60' }">
          <!-- Glow accent -->
          <div style="position:absolute;top:0;left:0;right:0;height:2px"
            :style="{ background: LEVEL_COLOR[sk.level] }">
          </div>
          <div style="font-size:28px;margin-bottom:10px">
            {{ sk.level === 'Expert' ? '🥇' : sk.level === 'Advanced' ? '🥈' : '🥉' }}
          </div>
          <div style="font-size:13px;color:var(--t1);margin-bottom:4px;font-weight:500">{{ sk.platform }}</div>
          <div style="margin-bottom:8px">
            <span style="font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:.6px;padding:3px 8px"
              :style="{ border: `1px solid ${LEVEL_COLOR[sk.level]}`, background: LEVEL_COLOR[sk.level] + '18', color: LEVEL_COLOR[sk.level] }">
              {{ sk.level.toUpperCase() }}
            </span>
          </div>
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">
            {{ sk.source || 'manual' }}
          </div>
          <div v-if="sk.updated_at" style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:2px">
            {{ fmtD(sk.updated_at) }}
          </div>
        </div>
      </div>

      <!-- Completed Trainings -->
      <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:12px">
        COMPLETED TRAININGS — {{ completedTrainings.length }}
      </div>

      <div v-if="completedTrainings.length === 0" class="empty" style="margin-bottom:24px">
        <div class="ec">— NO COMPLETED TRAININGS YET —</div>
      </div>

      <div v-else class="card" style="margin-bottom:24px">
        <div v-for="t in completedTrainings" :key="t.id"
          style="padding:14px 18px;border-bottom:1px solid var(--bdr-s);display:flex;align-items:center;gap:14px">
          <span style="font-size:22px">🎓</span>
          <div style="flex:1">
            <div style="font-size:13px;color:var(--t1)">{{ t.name }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-top:3px;display:flex;gap:6px">
              <span class="tag">{{ t.type }}</span>
              <span v-if="t.platform" class="tag">{{ t.platform }}</span>
              <span v-if="t.target_date">COMPLETED {{ fmtDs(t.target_date).toUpperCase() }}</span>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:18px;font-weight:300;font-family:'JetBrains Mono',monospace"
              :style="{ color: getTrainingRate(t.id) >= 80 ? 'var(--g)' : getTrainingRate(t.id) >= 60 ? 'var(--a)' : 'var(--r)' }">
              {{ getTrainingRate(t.id) }}%
            </div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">FINAL RATE</div>
          </div>
        </div>
      </div>

      <!-- Skill Gap — unearned platforms -->
      <div v-if="unearned.length">
        <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;letter-spacing:.8px;margin-bottom:12px">
          SKILL GAP — NOT YET EARNED
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
          <div v-for="pl in unearned" :key="pl"
            style="border:1px solid var(--bdr);padding:18px 20px;opacity:.5">
            <div style="font-size:28px;margin-bottom:10px">🔒</div>
            <div style="font-size:13px;color:var(--t2);margin-bottom:6px">{{ pl }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">NOT EARNED</div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { pct, fmtDs, fmtD, PLATFORMS, LEVEL_COLOR } from '@/lib/utils'

const store = useAppStore()
const d = computed(() => store.designer)

const mySkills = computed(() => d.value ? store.designerSkills.filter(s => s.designer_id === d.value.id) : [])

const sortedSkills = computed(() =>
  [...mySkills.value].sort((a, b) => {
    const order = { Expert: 3, Advanced: 2, Intermediate: 1 }
    return (order[b.level] || 0) - (order[a.level] || 0)
  })
)

const byLevel = (lvl) => mySkills.value.filter(s => s.level === lvl).length

const myEnrollments = computed(() => d.value ? store.enrollments.filter(e => e.designer_id === d.value.id) : [])

const completedTrainings = computed(() =>
  store.trainings.filter(t =>
    t.status === 'completed' && myEnrollments.value.some(e => e.training_id === t.id)
  ).sort((a, b) => new Date(b.target_date) - new Date(a.target_date))
)

const unearned = computed(() =>
  PLATFORMS.filter(pl => !mySkills.value.some(s => s.platform === pl))
)

function getTrainingRate(tid) {
  if (!d.value) return 0
  const tS = store.sessions.filter(s => s.training_id === tid)
  const mk = store.attendance.filter(a => tS.some(s => s.id === a.session_id) && a.designer_id === d.value.id && a.is_present !== null)
  return pct(mk.filter(a => a.is_present === true || a.is_present === 'late').length, mk.length)
}
</script>
