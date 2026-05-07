// patch-signout.mjs — run from training-tracker-vue/ root
// Usage: node patch-signout.mjs
// Fixes: Sign out button moved inline with user row, icon only (no text)

import { readFileSync, writeFileSync } from 'fs'

const path = './src/App.vue'
let src = readFileSync(path, 'utf8')

// Replace the sb-ft block — move sign out icon into u-row, remove standalone button
src = src.replace(
`        <!-- Sidebar footer -->
        <div class="sb-ft">
          <div class="u-row">
            <div class="u-av">{{ initials }}</div>
            <div style="flex:1;min-width:0">
              <div class="u-nm">{{ displayName }}</div>
              <div class="u-rl">{{ store.role }}</div>
            </div>
          </div>
          <button class="ni" style="margin-top:4px" @click="signOut">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
          <button class="tt" id="tt-btn" style="margin:8px 8px 0" @click="toggleTheme">
            {{ isDark ? '☀ Light' : '◑ Dark' }}
          </button>
        </div>`,
`        <!-- Sidebar footer -->
        <div class="sb-ft">
          <div class="u-row">
            <div class="u-av">{{ initials }}</div>
            <div style="flex:1;min-width:0">
              <div class="u-nm">{{ displayName }}</div>
              <div class="u-rl">{{ store.role }}</div>
            </div>
            <button class="btn btn-ic" style="padding:5px;color:var(--t3);flex-shrink:0" title="Sign out" @click="signOut">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
          <button class="tt" id="tt-btn" style="margin:8px 8px 0" @click="toggleTheme">
            {{ isDark ? '☀ Light' : '◑ Dark' }}
          </button>
        </div>`
)

writeFileSync(path, src)
console.log('✓ Sign out button patched — icon only, inline with user row')
