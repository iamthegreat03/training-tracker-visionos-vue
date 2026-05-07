// ── Formatting ────────────────────────────────────────────────
export const fmtD = d =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export const fmtDs = d =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

export const shortName = n => {
  if (!n) return '—'
  const p = n.trim().split(' ')
  return p.length >= 2 ? `${p[0]} ${p[p.length - 1][0]}.` : n
}

export const init = n =>
  n ? n.split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase() : '??'

export const pct = (n, d) => d > 0 ? Math.round((n / d) * 100) : 0

// ── Attendance helpers ────────────────────────────────────────
// DB stores is_present as text: 'true' | 'false' | 'late' | null
export const normAtt = v => {
  if (v === true  || v === 'true')  return true
  if (v === false || v === 'false') return false
  if (v === 'late') return 'late'
  return null
}

export const ATT_STATES = [null, true, 'late', false]

export const cycleAtt = cur => {
  const i = ATT_STATES.indexOf(cur)
  return ATT_STATES[(i + 1) % ATT_STATES.length]
}

export const attClass = v => {
  if (v === true)    return 'p'
  if (v === 'late')  return 'l'
  if (v === false)   return 'a'
  return ''
}

export const attLabel = v => {
  if (v === true)    return '✓'
  if (v === 'late')  return '~'
  if (v === false)   return '✗'
  return ''
}

// ── Constants ─────────────────────────────────────────────────
export const DAYS      = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
export const TIERS     = ['Tier 1', 'Tier 2', 'Tier 3']
export const TYPES     = ['Hands-On', 'Discussion']
export const SKILLS    = ['Theme Setup', 'Automation Logic', 'Coding', 'Proper Way of Building', 'Web Page Responsiveness', 'Backend Integration']
export const PLATFORMS = ['Clickfunnels', 'Wordpress', 'Shopify', 'Wix', 'GoHighLevel']
export const LEVELS    = ['Intermediate', 'Advanced', 'Expert']
export const LEVEL_COLOR = { Intermediate: 'var(--bl)', Advanced: 'var(--a)', Expert: 'var(--g)' }
export const LEVEL_SHORT = { Intermediate: 'INT', Advanced: 'ADV', Expert: 'EXP' }

// ── Date ──────────────────────────────────────────────────────
export const TODAY = new Date().toISOString().slice(0, 10)
