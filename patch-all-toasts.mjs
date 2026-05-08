// patch-all-toasts.mjs
// node patch-all-toasts.mjs
// Adds missing toast success/error notifications across all views

import { readFileSync, writeFileSync } from 'fs'

let changed = []

function patch(filePath, replacements) {
  let src = readFileSync(filePath, 'utf8')
  let fileChanged = false
  for (const [find, replace, label] of replacements) {
    if (src.includes(find)) {
      src = src.replace(find, replace)
      console.log(`  ✓ ${label}`)
      fileChanged = true
    } else {
      console.log(`  - SKIP (already patched or not found): ${label}`)
    }
  }
  if (fileChanged) {
    writeFileSync(filePath, src)
    changed.push(filePath)
  }
}

// ─── AttendanceView.vue ───────────────────────────────────────────────────
console.log('\nAttendanceView.vue:')
patch('./src/views/AttendanceView.vue', [
  // addSession — missing toast + error
  [
    `   if (!error) { showAddSess.value = false; await store.loadAll() }
   saving.value = false
}

const confirmDelSess`,
    `   if (error) { toast(error.message, 'er'); saving.value = false; return }
   toast('Session added')
   showAddSess.value = false
   await store.loadAll()
   saving.value = false
}

const confirmDelSess`,
    'addSession: error + success toast'
  ],
  // delSession — missing toast
  [
    `   await db.from('training_sessions').delete().eq('id', session.value.id)
   selS.value = null
   confirmDelSess.value = false
   await store.loadAll()
   saving.value = false`,
    `   const { error: delErr } = await db.from('training_sessions').delete().eq('id', session.value.id)
   if (delErr) { toast(delErr.message, 'er'); saving.value = false; return }
   toast('Session deleted')
   selS.value = null
   confirmDelSess.value = false
   await store.loadAll()
   saving.value = false`,
    'delSession: error + success toast'
  ],
  // saveNote — missing toast
  [
    `   if (!error) { showNote.value = false; await store.loadAll() }
   saving.value = false
}

const showReschedule`,
    `   if (error) { toast(error.message, 'er'); saving.value = false; return }
   toast('Note saved')
   showNote.value = false
   await store.loadAll()
   saving.value = false
}

const showReschedule`,
    'saveNote: error + success toast'
  ],
  // saveReschedule — missing toast
  [
    `   if (!error) { showReschedule.value = false; await store.loadAll() }
   saving.value = false
}

function exportCSV`,
    `   if (error) { toast(error.message, 'er'); saving.value = false; return }
   toast('Make-up scheduled')
   showReschedule.value = false
   await store.loadAll()
   saving.value = false
}

function exportCSV`,
    'saveReschedule: error + success toast'
  ],
  // markAll — missing toast
  [
    `   if(upserts.length) {
      db.from('attendance').upsert(upserts, { onConflict: 'session_id,designer_id' }).then(()=>store.loadAll())
   }
}`,
    `   if(upserts.length) {
      const { error: maErr } = await db.from('attendance').upsert(upserts, { onConflict: 'session_id,designer_id' })
      if (maErr) toast(maErr.message, 'er')
      else toast(\`Marked \${upserts.length} designer\${upserts.length !== 1 ? 's' : ''}\`)
      await store.loadAll()
   }
}`,
    'markAll: error + success toast'
  ],
])

// ─── DesignersView.vue ────────────────────────────────────────────────────
console.log('\nDesignersView.vue:')
patch('./src/views/DesignersView.vue', [
  // Add useToast import
  [
    `import AppModal from '@/components/AppModal.vue'`,
    `import AppModal from '@/components/AppModal.vue'
import { useToast } from '@/composables/useToast'`,
    'Add useToast import'
  ],
  // Add toast destructure after store
  [
    `const store = useAppStore()
`,
    `const store = useAppStore()
const { toast } = useToast()
`,
    'Destructure toast'
  ],
  // saveDes — missing toast + error
  [
    `  if (!error) { showEdit.value = false; await store.loadAll() }
  saving.value = false
}

async function deleteDes`,
    `  if (error) { toast(error.message, 'er'); saving.value = false; return }
  toast(editForm.id ? 'Designer updated' : 'Designer added')
  showEdit.value = false
  await store.loadAll()
  saving.value = false
}

async function deleteDes`,
    'saveDes: error + success toast'
  ],
  // deleteDes — missing toast + error
  [
    `  const { error } = await db.from('designers').delete().eq('id', id)
  if (!error) await store.loadAll()
}`,
    `  const { error } = await db.from('designers').delete().eq('id', id)
  if (error) { toast(error.message, 'er'); return }
  toast('Designer deleted')
  await store.loadAll()
}`,
    'deleteDes: error + success toast'
  ],
  // doXfer — missing toast + error
  [
    `  if (!error) { showXfer.value = false; await store.loadAll() }
  saving.value = false
}`,
    `  if (error) { toast(error.message, 'er'); saving.value = false; return }
  toast(\`\${xferDes.value.name} transferred to \${xferTeam.value}\`)
  showXfer.value = false
  await store.loadAll()
  saving.value = false
}`,
    'doXfer: error + success toast'
  ],
  // doBulkEnroll — missing toast + error
  [
    `  if (!error) { showBulkEnroll.value = false; exitBulk(); await store.loadAll() }
  saving.value = false
}`,
    `  if (error) { toast(error.message, 'er'); saving.value = false; return }
  toast(\`\${selSet.value.size} designer\${selSet.value.size !== 1 ? 's' : ''} enrolled\`)
  showBulkEnroll.value = false
  exitBulk()
  await store.loadAll()
  saving.value = false
}`,
    'doBulkEnroll: error + success toast'
  ],
  // doBulkTransfer — missing toast
  [
    `  showBulkTransfer.value = false
  exitBulk()
  await store.loadAll()
  saving.value = false
}

// ── Bulk Delete`,
    `  toast(\`\${selSet.value.size} designer\${selSet.value.size !== 1 ? 's' : ''} transferred to \${bulkXferTeam.value}\`)
  showBulkTransfer.value = false
  exitBulk()
  await store.loadAll()
  saving.value = false
}

// ── Bulk Delete`,
    'doBulkTransfer: success toast'
  ],
  // doBulkDelete — missing toast
  [
    `  exitBulk()
  await store.loadAll()
  saving.value = false
}

// ── Designer Profile`,
    `  toast(\`\${selSet.value.size} designer\${selSet.value.size !== 1 ? 's' : ''} deleted\`)
  exitBulk()
  await store.loadAll()
  saving.value = false
}

// ── Designer Profile`,
    'doBulkDelete: success toast'
  ],
])

// ─── TeamsView.vue ────────────────────────────────────────────────────────
console.log('\nTeamsView.vue:')
patch('./src/views/TeamsView.vue', [
  // Add useToast import
  [
    `import AppModal from '@/components/AppModal.vue'`,
    `import AppModal from '@/components/AppModal.vue'
import { useToast } from '@/composables/useToast'`,
    'Add useToast import'
  ],
  // Add toast destructure
  [
    `const store = useAppStore()

const COLORS`,
    `const store = useAppStore()
const { toast } = useToast()

const COLORS`,
    'Destructure toast'
  ],
  // saveReshuffle — missing toast + error
  [
    `  cancelReshuffle()
  await store.loadAll()
  saving.value = false
}`,
    `  const count = entries.length
  toast(\`\${count} designer\${count !== 1 ? 's' : ''} reshuffled\`)
  cancelReshuffle()
  await store.loadAll()
  saving.value = false
}`,
    'saveReshuffle: success toast'
  ],
  // addTeam — missing toast + error
  [
    `  if (!error) { showAddTeam.value = false; await store.loadAll() }
  saving.value = false
}`,
    `  if (error) { toast(error.message, 'er'); saving.value = false; return }
  toast(\`Team "\${newTeamName.value.trim()}" created\`)
  showAddTeam.value = false
  await store.loadAll()
  saving.value = false
}`,
    'addTeam: error + success toast'
  ],
  // deleteTeam — missing toast + error
  [
    `  if (!error) { showDeleteTeam.value = false; deleteTarget.value = null; await store.loadAll() }
  saving.value = false
}`,
    `  if (error) { toast(error.message, 'er'); saving.value = false; return }
  toast('Team deleted')
  showDeleteTeam.value = false
  deleteTarget.value = null
  await store.loadAll()
  saving.value = false
}`,
    'deleteTeam: error + success toast'
  ],
])

// ─── UsersView.vue ────────────────────────────────────────────────────────
console.log('\nUsersView.vue:')
patch('./src/views/UsersView.vue', [
  // Add useToast import
  [
    `import AppModal from '@/components/AppModal.vue'`,
    `import AppModal from '@/components/AppModal.vue'
import { useToast } from '@/composables/useToast'`,
    'Add useToast import'
  ],
  // Add toast destructure
  [
    `const store = useAppStore()

// ── Constants`,
    `const store = useAppStore()
const { toast } = useToast()

// ── Constants`,
    'Destructure toast'
  ],
  // removeUser — missing toast + error
  [
    `  const { error } = await db.from('user_roles').delete().eq('id', id)
  if (!error) await loadUsers()
}`,
    `  const { error } = await db.from('user_roles').delete().eq('id', id)
  if (error) { toast(error.message, 'er'); return }
  toast('User removed')
  await loadUsers()
}`,
    'removeUser: error + success toast'
  ],
  // savePerms — missing toast + error
  [
    `  const { error } = await db.from('user_roles').update({ permissions: permsPayload }).eq('id', permsUser.value.id)
  if (!error) { showPermsModal.value = false; await loadUsers() }
  saving.value = false
}`,
    `  const { error } = await db.from('user_roles').update({ permissions: permsPayload }).eq('id', permsUser.value.id)
  if (error) { toast(error.message, 'er'); saving.value = false; return }
  toast('Permissions saved')
  showPermsModal.value = false
  await loadUsers()
  saving.value = false
}`,
    'savePerms: error + success toast'
  ],
])

// ─── SkillSetView.vue ─────────────────────────────────────────────────────
console.log('\nSkillSetView.vue:')
patch('./src/views/SkillSetView.vue', [
  // Check if useToast already imported
  [
    `import { useAppStore } from '@/stores/app'
import { db } from '@/lib/supabase'`,
    `import { useAppStore } from '@/stores/app'
import { db } from '@/lib/supabase'
import { useToast } from '@/composables/useToast'`,
    'Add useToast import'
  ],
  [
    `const store = useAppStore()
`,
    `const store = useAppStore()
const { toast } = useToast()
`,
    'Destructure toast'
  ],
])

// ─── Summary ──────────────────────────────────────────────────────────────
console.log(`\n✅ Done. Modified files:`)
changed.forEach(f => console.log(`  ${f}`))
console.log('\n  git add src/views/AttendanceView.vue src/views/DesignersView.vue src/views/TeamsView.vue src/views/UsersView.vue src/views/SkillSetView.vue')
console.log('  git commit -m "fix(toast): add success/error toasts across all views"')
console.log('  git push')
