// patch-training-toast.mjs
// node patch-training-toast.mjs
// Adds toast success/error notifications to saveTraining() in TrainingsView.vue

import { readFileSync, writeFileSync } from 'fs'

const path = './src/views/TrainingsView.vue'
let src = readFileSync(path, 'utf8')

// 1. Add useToast import
src = src.replace(
  `import AppModal from '@/components/AppModal.vue'`,
  `import AppModal from '@/components/AppModal.vue'
import { useToast } from '@/composables/useToast'`
)

// 2. Add const { toast } = useToast() after store
src = src.replace(
  `const store = useAppStore()

const filter = ref('all')`,
  `const store = useAppStore()
const { toast } = useToast()

const filter = ref('all')`
)

// 3. Add error handling on training insert/update + toast on success
src = src.replace(
  `  let tid = editT.value.id
  if (tid) {
    await db.from('trainings').update(pl).eq('id', tid)
  } else {
    const { data } = await db.from('trainings').insert(pl).select()
    tid = data?.[0]?.id
  }`,
  `  const isNew = !editT.value.id
  let tid = editT.value.id
  if (tid) {
    const { error } = await db.from('trainings').update(pl).eq('id', tid)
    if (error) { toast(error.message, 'er'); saving.value = false; return }
  } else {
    const { data, error } = await db.from('trainings').insert(pl).select()
    if (error) { toast(error.message, 'er'); saving.value = false; return }
    tid = data?.[0]?.id
  }`
)

// 4. Add toast after session generation + enrollments, before showEdit = false
src = src.replace(
  `  showEdit.value = false
  await store.loadAll()
  saving.value = false
}`,
  `  // Toast with session count info
  const sessCount = store.sessions.filter(s => s.training_id === tid).length
  if (isNew) {
    toast(sessCount > 0 ? \`Training created · \${sessCount} session\${sessCount !== 1 ? 's' : ''} generated\` : 'Training created')
  } else {
    toast('Training updated')
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
  ['useToast import', result.includes("import { useToast }")],
  ['toast destructured', result.includes('const { toast } = useToast()')],
  ['error handling on save', result.includes("toast(error.message, 'er')")],
  ['success toast', result.includes('Training created')],
]

console.log('Verification:')
let allGood = true
for (const [label, pass] of checks) {
  console.log(`  ${pass ? '✓' : '✗'} ${label}`)
  if (!pass) allGood = false
}

if (allGood) {
  console.log('\n✅ Toast notifications added to saveTraining()')
  console.log('  git add src/views/TrainingsView.vue')
  console.log('  git commit -m "fix(trainings): add toast success/error notifications on save"')
  console.log('  git push')
} else {
  console.log('\n⚠ Some checks failed — check output above')
}
