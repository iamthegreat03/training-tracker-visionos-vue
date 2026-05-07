// patch-dedup.mjs — run from training-tracker-vue/ root
// node patch-dedup.mjs
// Removes duplicate const attFilter = ref('all') from AttendanceView.vue

import { readFileSync, writeFileSync } from 'fs'

const path = './src/views/AttendanceView.vue'
let src = readFileSync(path, 'utf8')

// Remove the second occurrence only
const target = `const attFilter = ref('all')\n`
const first = src.indexOf(target)
const second = src.indexOf(target, first + 1)

if (second === -1) {
  console.log('✓ No duplicate found — already clean')
} else {
  src = src.slice(0, second) + src.slice(second + target.length)
  writeFileSync(path, src)
  console.log('✓ Duplicate attFilter removed')
}
