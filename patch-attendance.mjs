// patch-attendance.mjs — run from training-tracker-vue/ root
// Usage: node patch-attendance.mjs
// Upgrades AttendanceView.vue toggleAtt to optimistic update + UNDO toast

import { readFileSync, writeFileSync } from 'fs'

const path = './src/views/AttendanceView.vue'
let src = readFileSync(path, 'utf8')

// 1. Add useToast import after the existing imports
src = src.replace(
  `import AppModal from '@/components/AppModal.vue'`,
  `import AppModal from '@/components/AppModal.vue'
import { useToast } from '@/composables/useToast'`
)

// 2. Add const { toast } = useToast() after const store = useAppStore()
src = src.replace(
  `const store = useAppStore()`,
  `const store = useAppStore()
const { toast } = useToast()`
)

// 3. Replace the existing toggleAtt with the optimistic version + UNDO
src = src.replace(
`async function toggleAtt(sid, did) {
   const a = store.attendance.find(x => x.session_id === sid && x.designer_id === did)
   const mu = store.makeups.find(x => x.original_session_id === sid && x.designer_id === did)
   if (mu && mu.is_attended === true) return // locked
   
   const cur = a ? normAtt(a.is_present) : null
   const nxt = cycleAtt(cur)
   const val = nxt === null ? null : (nxt === true ? 'true' : (nxt === false ? 'false' : 'late'))

   const prev = store.attendance.findIndex(x => x.session_id === sid && x.designer_id === did)
   if (prev > -1) store.attendance[prev].is_present = val
   else store.attendance.push({ session_id: sid, designer_id: did, is_present: val })

   if (val === null && a) {
      db.from('attendance').delete().eq('id', a.id).then(()=>store.loadAll())
   } else {
      db.from('attendance').upsert({ session_id: sid, designer_id: did, is_present: val }, { onConflict: 'session_id,designer_id' }).then(()=>store.loadAll())
   }
}`,
`async function toggleAtt(sid, did) {
   const mu = store.makeups.find(x => x.original_session_id === sid && x.designer_id === did)
   if (mu && mu.is_attended === true) return // locked — made up, can't toggle

   const a = store.attendance.find(x => x.session_id === sid && x.designer_id === did)
   const prev = a ? normAtt(a.is_present) : null
   const nxt  = cycleAtt(prev)
   const val  = nxt === null ? null : (nxt === true ? 'true' : nxt === false ? 'false' : 'late')
   const prevVal = prev === null ? null : (prev === true ? 'true' : prev === false ? 'false' : 'late')

   // ── OPTIMISTIC: update store immediately ──────────────────
   const idx = store.attendance.findIndex(x => x.session_id === sid && x.designer_id === did)
   if (idx > -1) store.attendance[idx].is_present = val
   else store.attendance.push({ session_id: sid, designer_id: did, is_present: val })

   // ── Sync to DB in background ──────────────────────────────
   const { error } = await db.from('attendance').upsert(
     { session_id: sid, designer_id: did, is_present: val },
     { onConflict: 'session_id,designer_id' }
   )

   if (error) {
     // Rollback on DB error
     const ri = store.attendance.findIndex(x => x.session_id === sid && x.designer_id === did)
     if (ri > -1) store.attendance[ri].is_present = prevVal
     toast(error.message, 'er')
     return
   }

   // ── Refresh only this session's attendance (not full reload) ──
   const { data: fresh } = await db.from('attendance').select('*').eq('session_id', sid)
   if (fresh) {
     store.attendance = [
       ...store.attendance.filter(x => x.session_id !== sid),
       ...fresh.map(x => ({ ...x, is_present: normAtt(x.is_present) }))
     ]
   }

   // ── UNDO toast ────────────────────────────────────────────
   const label = nxt === true ? 'Present' : nxt === false ? 'Absent' : nxt === 'late' ? 'Late' : 'Cleared'
   toast(\`Marked \${label}\`, 'ok', async () => {
     await db.from('attendance').upsert(
       { session_id: sid, designer_id: did, is_present: prevVal },
       { onConflict: 'session_id,designer_id' }
     )
     await store.loadAll()
   })
}`
)

writeFileSync(path, src)
console.log('✓ AttendanceView.vue — optimistic toggleAtt + UNDO toast applied')
