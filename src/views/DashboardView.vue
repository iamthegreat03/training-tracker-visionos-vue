<template>
  <div>
    <div class="sh">
      <div>
        <div class="sh-t">Dashboard</div>
        <div class="sh-s">Overview of training activity</div>
      </div>
    </div>

    <!-- Stat grid -->
    <div class="sg" style="margin-bottom:22px">
      <div class="st">
        <div class="st-l">Designers</div>
        <div class="st-v">{{ store.designers.length }}</div>
        <div class="st-s">Active members</div>
      </div>
      <div class="st">
        <div class="st-l">Trainings</div>
        <div class="st-v">{{ store.trainings.length }}</div>
        <div class="st-s">{{ activeCount }} active</div>
      </div>
      <div class="st">
        <div class="st-l">Sessions</div>
        <div class="st-v">{{ store.sessions.length }}</div>
        <div class="st-s">Total held</div>
      </div>
      <div class="st">
        <div class="st-l">Attendance</div>
        <div class="st-v">{{ overallRate }}%</div>
        <div class="st-s">Overall rate</div>
      </div>
    </div>

    <!-- Active trainings quick view -->
    <div class="card">
      <div class="c-hd">
        <span class="c-ttl">Active Trainings</span>
        <RouterLink to="/trainings">
          <button class="btn btn-g btn-sm">VIEW ALL</button>
        </RouterLink>
      </div>
      <div v-if="activeTrainings.length === 0" class="empty">
        <div class="ec">NO ACTIVE TRAININGS</div>
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Platform</th>
            <th>Enrolled</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in activeTrainings" :key="t.id">
            <td class="td1">{{ t.name }}</td>
            <td>
              <span v-if="t.type === 'Hands-On'" class="tag tag-a">HANDS-ON</span>
              <span v-else class="tag tag-b">DISCUSSION</span>
            </td>
            <td>{{ t.platform || '—' }}</td>
            <td>{{ enrolledCount(t.id) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { pct } from '@/lib/utils'

const store = useAppStore()

const activeTrainings = computed(() => store.trainings.filter(t => t.status === 'active'))
const activeCount     = computed(() => activeTrainings.value.length)

const enrolledCount = (tid) => store.enrollments.filter(e => e.training_id === tid).length

const overallRate = computed(() => {
  const marked = store.attendance.filter(a => a.is_present !== null)
  const present = marked.filter(a => a.is_present === true || a.is_present === 'late')
  return pct(present.length, marked.length)
})
</script>
