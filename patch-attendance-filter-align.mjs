// patch-attendance-filter-align.mjs
// node patch-attendance-filter-align.mjs

import { readFileSync, writeFileSync } from 'fs'

const path = './src/views/AttendanceView.vue'
let src = readFileSync(path, 'utf8')

// Change the session header back to a single flex row:
// left: date + hint | center: proof url | right: filter chips
src = src.replace(
  `        <div style="padding:12px 18px;border-bottom:1px solid var(--bdr);display:flex;flex-direction:column;gap:10px">`,
  `        <div style="padding:12px 18px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;gap:14px;flex-wrap:wrap">`
)

// Date block — give it a fixed min-width
src = src.replace(
  `          <div style="flex:1;min-width:200px">`,
  `          <div style="min-width:200px">`
)

// Proof URL — keep centered
src = src.replace(
  `          <!-- Proof URL inline input -->
          <div style="display:flex;align-items:center;justify-content:center;gap:7px;flex:1">`,
  `          <!-- Proof URL inline input -->
          <div style="display:flex;align-items:center;justify-content:center;gap:7px;flex:1">`
)

// Filter chips — push to right with margin-left:auto
src = src.replace(
  `          <!-- Attendance filter chips -->
          <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">`,
  `          <!-- Attendance filter chips -->
          <div style="display:flex;gap:6px;align-items:center;flex-shrink:0;margin-left:auto">`
)

writeFileSync(path, src)
console.log('✓ Filter chips aligned right')
console.log('\n  git add src/views/AttendanceView.vue')
console.log('  git commit -m "fix(attendance): align filter chips to right"')
console.log('  git push')
