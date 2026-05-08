// patch-training-sessions.mjs
// node patch-training-sessions.mjs
// Fixes: newly added training doesn't create sessions in attendance tab
// Root cause: saveTraining() in TrainingsView.vue never inserts into training_sessions

import { readFileSync, writeFileSync } from 'fs'

const path = './src/views/TrainingsView.vue'
let src = readFileSync(path, 'utf8')

// Replace the enrollment block after tid is confirmed — add session generation before enrollments
src = src.replace(
  `  if (tid) {
    // Process enrollments
    const enrolledIds = Object.keys(editT.value.enrollSel)
    const existingRows = store.enrollments.filter(e => e.training_id === tid)
    
    // Deletes
    const toDelete = existingRows.filter(e => !enrolledIds.includes(e.designer_id))
    for (const d of toDelete) {
      await db.from('training_enrollments').delete().eq('training_id', tid).eq('designer_id', d.designer_id)
    }
    
    // Upserts
    const upserts = enrolledIds.map(did => ({
      training_id: tid,
      designer_id: did,
      designer_schedule: editT.value.enrollSel[did]
    }))
    if (upserts.length) {
      await db.from('training_enrollments').upsert(upserts, { onConflict: 'training_id,designer_id' })
    }
  }

  showEdit.value = false
  await store.loadAll()
  saving.value = false
}`,
  `  if (tid) {
    // ── AUTO-GENERATE SESSIONS ─────────────────────────────────────────
    if (pl.type === 'Discussion') {
      // Discussion: schedule contains exact YYYY-MM-DD dates
      const exactDates = (editT.value.schedule || []).filter(d => d.includes('-')).sort()
      if (exactDates.length) {
        const { data: freshSess } = await db.from('training_sessions').select('session_date').eq('training_id', tid)
        const existingDates = (freshSess || []).map(s => s.session_date)
        const toInsert = exactDates
          .filter(d => !existingDates.includes(d))
          .map(d => {
            const dt = new Date(d + 'T00:00:00')
            const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dt.getDay()]
            return { training_id: tid, session_date: d, day_of_week: dayName }
          })
        if (toInsert.length) await db.from('training_sessions').insert(toInsert)
        // Set start_date and target_date from the date range
        const sorted = [...exactDates].sort()
        await db.from('trainings').update({ start_date: sorted[0], target_date: sorted[sorted.length - 1] }).eq('id', tid)
      }
    } else if (pl.start_date && pl.target_date && editT.value.schedule.length) {
      // Hands-On: generate one session per scheduled day between start and target
      const dayNums = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 }
      const scheduledDayNums = editT.value.schedule.map(d => dayNums[d]).filter(Boolean)
      const [sy, sm, sd] = pl.start_date.split('-').map(Number)
      const [ey, em, ed] = pl.target_date.split('-').map(Number)
      const start = new Date(sy, sm - 1, sd)
      const end = new Date(ey, em - 1, ed)
      const toInsert = []
      const cur = new Date(start)
      while (cur <= end) {
        if (scheduledDayNums.includes(cur.getDay())) {
          const yyyy = cur.getFullYear()
          const mm = String(cur.getMonth() + 1).padStart(2, '0')
          const dd = String(cur.getDate()).padStart(2, '0')
          const dateStr = \`\${yyyy}-\${mm}-\${dd}\`
          const dayName = Object.keys(dayNums).find(k => dayNums[k] === cur.getDay())
          toInsert.push({ training_id: tid, session_date: dateStr, day_of_week: dayName })
        }
        cur.setDate(cur.getDate() + 1)
      }
      if (toInsert.length) {
        // Only insert dates that don't already exist (safe for edits)
        const { data: freshSess } = await db.from('training_sessions').select('session_date').eq('training_id', tid)
        const existingDates = (freshSess || []).map(s => s.session_date)
        const newSessions = toInsert.filter(s => !existingDates.includes(s.session_date))
        if (newSessions.length) await db.from('training_sessions').insert(newSessions)
      }
    }

    // ── PROCESS ENROLLMENTS ────────────────────────────────────────────
    const enrolledIds = Object.keys(editT.value.enrollSel)
    const existingRows = store.enrollments.filter(e => e.training_id === tid)

    // Deletes
    const toDelete = existingRows.filter(e => !enrolledIds.includes(e.designer_id))
    for (const d of toDelete) {
      await db.from('training_enrollments').delete().eq('training_id', tid).eq('designer_id', d.designer_id)
    }

    // Upserts
    const upserts = enrolledIds.map(did => ({
      training_id: tid,
      designer_id: did,
      designer_schedule: editT.value.enrollSel[did]
    }))
    if (upserts.length) {
      await db.from('training_enrollments').upsert(upserts, { onConflict: 'training_id,designer_id' })
    }
  }

  showEdit.value = false
  await store.loadAll()
  saving.value = false
}`
)

writeFileSync(path, src)

// Verify
const result = readFileSync(path, 'utf8')
const checks = [
  ['Discussion session generation', result.includes("filter(d => d.includes('-'))")],
  ['Hands-On session generation', result.includes('scheduledDayNums.includes(cur.getDay())')],
  ['Existing dates check', result.includes('existingDates.includes(s.session_date)')],
]

console.log('Verification:')
let allGood = true
for (const [label, pass] of checks) {
  console.log(`  ${pass ? '✓' : '✗'} ${label}`)
  if (!pass) allGood = false
}

if (allGood) {
  console.log('\n✅ Session generation added to saveTraining()')
  console.log('  git add src/views/TrainingsView.vue')
  console.log('  git commit -m "fix(trainings): auto-generate sessions when creating/editing training"')
  console.log('  git push')
} else {
  console.log('\n⚠ Patch failed — string not found. Check TrainingsView.vue manually.')
}
