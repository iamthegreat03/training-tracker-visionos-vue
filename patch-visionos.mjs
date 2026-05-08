// patch-visionos.mjs — run from training-tracker-vue/ root
// node patch-visionos.mjs
//
// Full VisionOS redesign for PT Tracker:
//  1. Rewrites src/assets/main.css  — glassmorphism design system
//  2. Rewrites src/App.vue          — new sidebar + topbar shell

import { writeFileSync, readFileSync, existsSync } from 'fs'

/* ─────────────────────────────────────────────────────────────
   GUARD — must run from project root
───────────────────────────────────────────────────────────── */
if (!existsSync('./src/assets/main.css') || !existsSync('./src/App.vue')) {
  console.error('✗  Run this from the training-tracker-vue/ root directory.')
  process.exit(1)
}

/* ─────────────────────────────────────────────────────────────
   1. main.css  — full VisionOS design system
───────────────────────────────────────────────────────────── */
const css = `/* ============================================================
   PT TRACKER — VisionOS Design System
   Glassmorphism · Frosted Glass · Spatial Depth
   Accent: #f07828  Fonts: Inter + JetBrains Mono
   ============================================================ */

/* ── DARK THEME ─────────────────────────────────────────── */
[data-theme="dark"] {
  --bg:           #0c0e13;
  --bg2:          #101318;
  --bg3:          #080a0e;

  --sur:          rgba(255,255,255,0.055);
  --sur-h:        rgba(255,255,255,0.085);
  --sur-active:   rgba(255,255,255,0.11);

  --glass-bg:     rgba(255,255,255,0.06);
  --glass-bg-h:   rgba(255,255,255,0.10);

  --bdr:          rgba(255,255,255,0.09);
  --bdr-h:        rgba(255,255,255,0.18);
  --bdr-s:        rgba(255,255,255,0.05);
  --bdr-glass:    rgba(255,255,255,0.12);

  --t1:           rgba(255,255,255,0.95);
  --t2:           rgba(255,255,255,0.65);
  --t3:           rgba(255,255,255,0.40);
  --t4:           rgba(255,255,255,0.22);

  --sb:           rgba(10,12,17,0.88);
  --tb:           rgba(10,12,17,0.72);

  --btn-bg:       rgba(255,255,255,0.94);
  --btn-txt:      #0c0e13;
  --btn-h:        rgba(255,255,255,1);

  --ring:         rgba(240,120,40,0.40);

  --g:            #34d399;
  --r:            #fb7185;
  --a:            #fbbf24;
  --bl:           #60a5fa;
  --g-bg:         rgba(52,211,153,0.10);
  --r-bg:         rgba(251,113,133,0.10);
  --a-bg:         rgba(251,191,36,0.10);
  --bl-bg:        rgba(96,165,250,0.10);

  --accent:       #f07828;
  --accent-t:     rgba(240,120,40,0.12);
  --accent-glow:  rgba(240,120,40,0.22);

  --shadow-sm:    0 2px 8px rgba(0,0,0,0.40);
  --shadow-md:    0 8px 32px rgba(0,0,0,0.50);
  --shadow-lg:    0 24px 64px rgba(0,0,0,0.60);
  --shadow-glass: 0 4px 24px rgba(0,0,0,0.45),
                  inset 0 1px 0 rgba(255,255,255,0.08),
                  inset 0 -1px 0 rgba(0,0,0,0.12);

  --card-radius:  16px;
  --pill-radius:  999px;
}

/* ── LIGHT THEME ────────────────────────────────────────── */
[data-theme="light"] {
  --bg:           #dfe5f0;
  --bg2:          #d5dcea;
  --bg3:          #ccd4e3;

  --sur:          rgba(255,255,255,0.60);
  --sur-h:        rgba(255,255,255,0.78);
  --sur-active:   rgba(255,255,255,0.90);

  --glass-bg:     rgba(255,255,255,0.55);
  --glass-bg-h:   rgba(255,255,255,0.72);

  --bdr:          rgba(0,0,0,0.08);
  --bdr-h:        rgba(0,0,0,0.16);
  --bdr-s:        rgba(0,0,0,0.05);
  --bdr-glass:    rgba(255,255,255,0.80);

  --t1:           rgba(10,12,20,0.95);
  --t2:           rgba(10,12,20,0.62);
  --t3:           rgba(10,12,20,0.40);
  --t4:           rgba(10,12,20,0.22);

  --sb:           rgba(220,228,240,0.88);
  --tb:           rgba(225,232,243,0.75);

  --btn-bg:       #0c0e13;
  --btn-txt:      #ffffff;
  --btn-h:        #1a1d26;

  --ring:         rgba(240,120,40,0.35);

  --g:            #059669;
  --r:            #e11d48;
  --a:            #d97706;
  --bl:           #2563eb;
  --g-bg:         rgba(5,150,105,0.10);
  --r-bg:         rgba(225,29,72,0.10);
  --a-bg:         rgba(217,119,6,0.10);
  --bl-bg:        rgba(37,99,235,0.10);

  --accent:       #e86a10;
  --accent-t:     rgba(232,106,16,0.10);
  --accent-glow:  rgba(232,106,16,0.18);

  --shadow-sm:    0 2px 8px rgba(0,0,0,0.10);
  --shadow-md:    0 8px 32px rgba(0,0,0,0.14);
  --shadow-lg:    0 24px 64px rgba(0,0,0,0.18);
  --shadow-glass: 0 4px 24px rgba(0,0,0,0.10),
                  inset 0 1px 0 rgba(255,255,255,0.90),
                  inset 0 -1px 0 rgba(0,0,0,0.04);

  --card-radius:  16px;
  --pill-radius:  999px;
}

/* ── RESET ──────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }

html { -webkit-tap-highlight-color: transparent }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--t1);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
  height: 100dvh;
}

/* ── SCENE BACKGROUND ───────────────────────────────────── */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse 80% 60% at 20% 10%,  rgba(240,120,40,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 80%,  rgba(96,165,250,0.06) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%,  rgba(52,211,153,0.04) 0%, transparent 60%),
    var(--bg);
  pointer-events: none;
}

/* ── APP SHELL ──────────────────────────────────────────── */
#app {
  display: flex;
  height: 100dvh;
  overflow: hidden;
  position: relative;
}

/* ── SIDEBAR ────────────────────────────────────────────── */
#sb {
  width: 232px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--sb);
  backdrop-filter: saturate(200%) blur(40px);
  -webkit-backdrop-filter: saturate(200%) blur(40px);
  border-right: 1px solid var(--bdr);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  transition: background 0.3s;
  position: relative;
  z-index: 20;
}

#sb::-webkit-scrollbar { display: none }

/* subtle top-edge glow */
#sb::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(240,120,40,0.3), transparent);
  pointer-events: none;
}

.sb-top {
  padding: 20px 16px 12px;
  flex-shrink: 0;
}

.sb-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--card-radius);
  background: var(--sur);
  border: 1px solid var(--bdr);
  box-shadow: var(--shadow-glass);
}

.sb-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #ff4400));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 14px var(--accent-glow);
  flex-shrink: 0;
}

.sb-nm {
  font-size: 13px;
  font-weight: 600;
  color: var(--t1);
  letter-spacing: -0.2px;
}

.sb-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--accent);
  letter-spacing: 1.2px;
  margin-top: 1px;
}

.sb-sec {
  padding: 6px 12px;
  flex-shrink: 0;
}

.sb-lbl {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 500;
  color: var(--t4);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 8px 10px 6px;
}

/* Nav item */
.ni {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: var(--t2);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
  position: relative;
}

.ni:hover {
  background: var(--sur-h);
  color: var(--t1);
}

.ni.on {
  background: var(--sur-active);
  color: var(--t1);
  box-shadow: var(--shadow-glass);
  border: 1px solid var(--bdr-glass);
}

.ni.on::before {
  content: '';
  position: absolute;
  left: 0; top: 25%; bottom: 25%;
  width: 3px;
  border-radius: 2px;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

.ni svg { flex-shrink: 0; opacity: 0.75 }
.ni.on svg { opacity: 1 }

/* Sidebar footer */
.sb-ft {
  margin-top: auto;
  padding: 12px;
  border-top: 1px solid var(--bdr);
  flex-shrink: 0;
}

.u-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: var(--sur);
  border: 1px solid var(--bdr);
}

.u-av {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #ff4400));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px var(--accent-glow);
}

.u-inf { flex: 1; min-width: 0 }
.u-nm {
  font-size: 12px;
  font-weight: 600;
  color: var(--t1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.u-rl {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--t3);
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

/* ── MAIN AREA ──────────────────────────────────────────── */
#main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* ── TOPBAR ─────────────────────────────────────────────── */
#tb {
  background: var(--tb);
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  border-bottom: 1px solid var(--bdr);
  padding: 0 24px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 30;
  transition: background 0.3s;
}

#tb-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--t1);
  letter-spacing: -0.1px;
}

#tb-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── PAGE ───────────────────────────────────────────────── */
#page {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 28px;
  scrollbar-width: thin;
  scrollbar-color: var(--bdr-h) transparent;
  transition: opacity 0.15s ease;
}

#page::-webkit-scrollbar { width: 5px }
#page::-webkit-scrollbar-track { background: transparent }
#page::-webkit-scrollbar-thumb { background: var(--bdr-h); border-radius: 3px }

#page.fading { opacity: 0 }

/* ── BUTTONS ────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 18px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1px;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  transition: all 0.14s;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

/* Glass shimmer on hover */
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
}
.btn:hover::after { opacity: 1 }

.btn-p {
  background: var(--btn-bg);
  color: var(--btn-txt);
  box-shadow: 0 2px 12px rgba(0,0,0,0.25);
}
.btn-p:hover { background: var(--btn-h); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.30) }
.btn-p:active { transform: none }

.btn-g {
  background: var(--sur);
  color: var(--t1);
  border: 1px solid var(--bdr);
  backdrop-filter: blur(8px);
}
.btn-g:hover { background: var(--sur-h); border-color: var(--bdr-h) }

.btn-d {
  background: var(--r-bg);
  color: var(--r);
  border: 1px solid rgba(251,113,133,0.20);
}
.btn-d:hover { background: rgba(251,113,133,0.18) }

.btn-a {
  background: var(--a-bg);
  color: var(--a);
  border: 1px solid rgba(251,191,36,0.20);
}

.btn-acc {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 12px var(--accent-glow);
}
.btn-acc:hover { filter: brightness(1.08); transform: translateY(-1px) }

.btn-sm { padding: 5px 12px; font-size: 11px; border-radius: 8px }
.btn-xs { padding: 3px 8px; font-size: 10px; border-radius: 7px }

.btn-ic {
  padding: 7px;
  border: 1px solid var(--bdr);
  background: var(--sur);
  border-radius: 10px;
}
.btn-ic:hover { border-color: var(--bdr-h); background: var(--sur-h) }

.btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none !important }

/* ── CARDS ──────────────────────────────────────────────── */
.card {
  background: var(--glass-bg);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid var(--bdr-glass);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-glass);
  overflow: hidden;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.card:hover {
  border-color: var(--bdr-h);
  box-shadow: var(--shadow-md);
}

.c-hd {
  padding: 14px 18px;
  border-bottom: 1px solid var(--bdr);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(255,255,255,0.02);
}

.c-ttl {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 500;
  color: var(--t4);
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

/* ── SECTION HEADER ─────────────────────────────────────── */
.sh {
  border-bottom: 1px solid var(--bdr);
  padding-bottom: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.sh-t {
  font-size: 22px;
  font-weight: 300;
  color: var(--t1);
  letter-spacing: -0.5px;
}

.sh-s {
  font-size: 11px;
  color: var(--t3);
  margin-top: 3px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.3px;
}

/* ── STATS GRID ─────────────────────────────────────────── */
.sg {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--bdr);
  border: 1px solid var(--bdr);
  border-radius: var(--card-radius);
  overflow: hidden;
  box-shadow: var(--shadow-glass);
}

.sc {
  background: var(--glass-bg);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  padding: 18px 20px;
  transition: background 0.15s;
}

.sc:hover { background: var(--glass-bg-h) }

.sv {
  font-size: 26px;
  font-weight: 300;
  color: var(--t1);
  letter-spacing: -0.8px;
  line-height: 1;
  margin-bottom: 5px;
}

.sl {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--t3);
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* ── INPUTS ─────────────────────────────────────────────── */
.inp {
  width: 100%;
  padding: 9px 13px;
  background: var(--sur);
  border: 1px solid var(--bdr);
  border-radius: 10px;
  color: var(--t1);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  backdrop-filter: blur(8px);
}

.inp:focus {
  border-color: var(--accent);
  background: var(--sur-h);
  box-shadow: 0 0 0 3px var(--ring);
}

.inp::placeholder { color: var(--t4) }

select.inp { cursor: pointer }

textarea.inp {
  resize: vertical;
  min-height: 80px;
  font-family: 'Inter', sans-serif;
}

.fg {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.fg label {
  font-size: 11px;
  font-weight: 500;
  color: var(--t3);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

/* ── MODAL ──────────────────────────────────────────────── */
.bkd {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.mdl {
  background: var(--glass-bg);
  backdrop-filter: saturate(200%) blur(40px);
  -webkit-backdrop-filter: saturate(200%) blur(40px);
  border: 1px solid var(--bdr-glass);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.97) }
  to   { opacity: 1; transform: translateY(0) scale(1) }
}

.mdl-hd {
  padding: 18px 22px;
  border-bottom: 1px solid var(--bdr);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.02);
}

.mdl-t {
  font-size: 16px;
  font-weight: 600;
  color: var(--t1);
  letter-spacing: -0.3px;
}

.mdl-bd {
  flex: 1;
  overflow-y: auto;
  padding: 22px;
  scrollbar-width: thin;
  scrollbar-color: var(--bdr-h) transparent;
}

.mdl-ft {
  padding: 16px 22px;
  border-top: 1px solid var(--bdr);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.02);
}

/* ── TABLES ─────────────────────────────────────────────── */
.tbl {
  width: 100%;
  border-collapse: collapse;
}

.tbl th {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 500;
  color: var(--t4);
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid var(--bdr);
  white-space: nowrap;
}

.tbl td {
  padding: 11px 14px;
  font-size: 13px;
  color: var(--t1);
  border-bottom: 1px solid var(--bdr-s);
  vertical-align: middle;
}

.tbl tbody tr { transition: background 0.12s }
.tbl tbody tr:hover { background: var(--sur-h) }
.tbl tbody tr:last-child td { border-bottom: none }

/* ── BADGES / PILLS ─────────────────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: var(--pill-radius);
  font-size: 10px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.5px;
}

.badge-g  { background: var(--g-bg);  color: var(--g);  border: 1px solid rgba(52,211,153,0.20) }
.badge-r  { background: var(--r-bg);  color: var(--r);  border: 1px solid rgba(251,113,133,0.20) }
.badge-a  { background: var(--a-bg);  color: var(--a);  border: 1px solid rgba(251,191,36,0.20) }
.badge-bl { background: var(--bl-bg); color: var(--bl); border: 1px solid rgba(96,165,250,0.20) }
.badge-acc { background: var(--accent-t); color: var(--accent); border: 1px solid rgba(240,120,40,0.22) }

/* ── CHIPS / FILTER TABS ────────────────────────────────── */
.chip {
  padding: 5px 13px;
  border-radius: var(--pill-radius);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--bdr);
  background: transparent;
  color: var(--t3);
  font-family: 'Inter', sans-serif;
  transition: all 0.14s;
}

.chip:hover { background: var(--sur-h); color: var(--t1); border-color: var(--bdr-h) }

.chip.on {
  background: var(--accent-t);
  color: var(--accent);
  border-color: rgba(240,120,40,0.30);
}

/* ── TOGGLES ────────────────────────────────────────────── */
.tog {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.tog input { position: absolute; opacity: 0; width: 0; height: 0 }

.tog-track {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--sur-active);
  border: 1px solid var(--bdr);
  position: relative;
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
}

.tog input:checked ~ .tog-track {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 10px var(--accent-glow);
}

.tog-track::after {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: rgba(255,255,255,0.90);
  box-shadow: 0 1px 4px rgba(0,0,0,0.30);
  transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
}

.tog input:checked ~ .tog-track::after { transform: translateX(16px) }

/* ── PROGRESS BARS ──────────────────────────────────────── */
.pb {
  height: 5px;
  background: var(--sur-active);
  border-radius: 3px;
  overflow: hidden;
}

.pb-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #ff4400));
  transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
}

.pb-fill.green  { background: linear-gradient(90deg, var(--g), color-mix(in srgb, var(--g) 70%, #00ff88)) }
.pb-fill.blue   { background: linear-gradient(90deg, var(--bl), color-mix(in srgb, var(--bl) 70%, #0088ff)) }

/* ── THEME TOGGLE BUTTON ────────────────────────────────── */
.tt {
  padding: 5px 12px;
  border: 1px solid var(--bdr);
  background: var(--sur);
  backdrop-filter: blur(8px);
  color: var(--t3);
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.14s;
}
.tt:hover { border-color: var(--bdr-h); color: var(--t1); background: var(--sur-h) }

/* ── ALERTS ─────────────────────────────────────────────── */
.al-e {
  border: 1px solid rgba(251,113,133,0.25);
  background: var(--r-bg);
  color: var(--r);
  padding: 10px 14px;
  font-size: 12px;
  margin-bottom: 14px;
  font-family: 'JetBrains Mono', monospace;
  border-radius: 10px;
  letter-spacing: 0.2px;
}

.al-i {
  border: 1px solid var(--bdr);
  padding: 10px 14px;
  font-size: 10px;
  color: var(--t4);
  margin-top: 14px;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1.7;
  border-radius: 10px;
  background: var(--sur);
}

/* ── LOADING / SPINNER ──────────────────────────────────── */
.lp {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  flex-direction: column;
  gap: 16px;
  background: var(--bg);
}

.lp-m {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  letter-spacing: 3px;
  color: var(--t1);
  animation: pulse 1.4s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5 }
  50% { opacity: 1 }
}

.spin {
  width: 18px;
  height: 18px;
  border: 2px solid var(--bdr-h);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg) } }

/* ── LOGIN ──────────────────────────────────────────────── */
.lgb {
  background: var(--glass-bg);
  backdrop-filter: saturate(200%) blur(40px);
  -webkit-backdrop-filter: saturate(200%) blur(40px);
  border: 1px solid var(--bdr-glass);
  border-radius: 20px;
  padding: 36px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
}

.lg-t {
  font-size: 20px;
  font-weight: 300;
  color: var(--t1);
  letter-spacing: -0.3px;
}

.lg-s {
  font-size: 12px;
  color: var(--t3);
  margin-top: 3px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.3px;
}

/* ── TOASTS ─────────────────────────────────────────────── */
#tc {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.tz {
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 12px;
  color: var(--t1);
  background: var(--glass-bg);
  backdrop-filter: saturate(200%) blur(30px);
  -webkit-backdrop-filter: saturate(200%) blur(30px);
  border: 1px solid var(--bdr-glass);
  box-shadow: var(--shadow-md);
  pointer-events: auto;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.3px;
  max-width: 320px;
}

.tz-ok { border-color: rgba(52,211,153,0.25) }
.tz-er { border-color: rgba(251,113,133,0.25) }

.undo-tz {
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 12px;
  background: var(--glass-bg);
  backdrop-filter: saturate(200%) blur(30px);
  -webkit-backdrop-filter: saturate(200%) blur(30px);
  border: 1px solid var(--bdr-glass);
  box-shadow: var(--shadow-md);
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--t1);
}

/* Toast transitions */
.toast-enter-active { animation: toastIn 0.25s cubic-bezier(0.34,1.56,0.64,1) }
.toast-leave-active { animation: toastOut 0.2s ease forwards }

@keyframes toastIn  { from { opacity:0; transform:translateY(10px) scale(0.95) } to { opacity:1; transform:none } }
@keyframes toastOut { from { opacity:1; transform:none } to { opacity:0; transform:translateY(10px) scale(0.95) } }

/* ── PULL TO REFRESH ────────────────────────────────────── */
#ptr {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 1px;
  color: var(--t3);
  background: var(--tb);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--bdr);
  z-index: 50;
  transform: translateY(-100%);
  transition: transform 0.2s ease;
}

#ptr.visible { transform: translateY(0) }

/* ── PAGE TRANSITION ────────────────────────────────────── */
.a-sc {
  animation: slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
}

/* ── SKELETON LOADER ─────────────────────────────────────── */
.skel {
  background: linear-gradient(90deg, var(--sur) 25%, var(--sur-h) 50%, var(--sur) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 6px;
}

@keyframes shimmer { to { background-position: -200% 0 } }

/* ── ATTENDANCE STATES ──────────────────────────────────── */
.att-p  { color: var(--g); }
.att-a  { color: var(--r); }
.att-l  { color: var(--a); }
.att-mk { color: var(--bl); }
.att-x  { color: var(--t4); }

/* Heatmap dot */
.ht-d {
  width: 10px; height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* ── TRAINER ZONE / DDB BUTTONS ─────────────────────────── */
.ddb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  border: 1px solid var(--bdr);
  background: var(--sur);
  color: var(--t1);
  transition: all 0.13s;
  letter-spacing: 0.3px;
}

.ddb:hover { background: var(--sur-h) }
.ddb.sel  { background: var(--accent); border-color: var(--accent); color: #fff; box-shadow: 0 2px 8px var(--accent-glow) }

/* ── SKILL MATRIX ───────────────────────────────────────── */
.sk-cell {
  width: 28px; height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.13s;
}

/* ── TEAMS GRID ─────────────────────────────────────────── */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--bdr);
}

/* ── BOTTOM NAV (mobile) ────────────────────────────────── */
@media (min-width: 641px) {
  #bnav, #bnav-saf { display: none !important }
}

#bnav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--sb);
  backdrop-filter: saturate(200%) blur(30px);
  -webkit-backdrop-filter: saturate(200%) blur(30px);
  border-top: 1px solid var(--bdr);
  z-index: 40;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

#bnav-inner {
  display: flex;
  height: 54px;
}

.bn-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: none;
  background: transparent;
  color: var(--t3);
  font-size: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.14s;
  padding: 0;
}

.bn-item svg { opacity: 0.6; transition: opacity 0.14s }
.bn-item.on { color: var(--accent) }
.bn-item.on svg { opacity: 1 }

#bnav-saf {
  height: env(safe-area-inset-bottom, 0px);
  background: var(--sb);
}

/* ── RESPONSIVE: MOBILE ─────────────────────────────────── */
@media (max-width: 640px) {
  #sb { display: none }

  body { overflow: hidden }

  #page {
    padding: 14px 14px calc(64px + env(safe-area-inset-bottom, 0px));
  }

  #tb { padding: 0 14px; height: 48px }

  .sg { grid-template-columns: repeat(2, 1fr) }

  .mdl { border-radius: 20px 20px 0 0; max-height: 92vh }
  .bkd { align-items: flex-end; padding: 0 }

  .mdl-bd { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch }
  .mdl-ft {
    flex-shrink: 0;
    padding-bottom: max(env(safe-area-inset-bottom, 0px), 12px);
  }

  #tc { bottom: calc(64px + env(safe-area-inset-bottom, 12px)); right: 12px; left: 12px }
  .tz, .undo-tz { max-width: 100% }
}

/* ── DESKTOP SIDEBAR WIDTHS ─────────────────────────────── */
@media (min-width: 641px) and (max-width: 900px) {
  #sb { width: 56px; overflow: visible }
  .sb-brand { padding: 8px; justify-content: center }
  .sb-nm, .sb-sub, .sb-lbl, .u-inf { display: none }
  .ni { justify-content: center; padding: 10px }
  .ni span:last-child { display: none }
  .u-row { justify-content: center; padding: 8px }
}

/* ── iOS SAFE AREA ──────────────────────────────────────── */
@supports (padding-top: env(safe-area-inset-top)) {
  #tb { padding-top: max(0px, env(safe-area-inset-top)) }
}

/* ── TEAMS RESPONSIVE ───────────────────────────────────── */
@media (max-width: 640px) {
  .teams-grid { grid-template-columns: 1fr !important }
}
@media (min-width: 641px) and (max-width: 900px) {
  .teams-grid { grid-template-columns: 1fr 1fr !important }
}
`

writeFileSync('./src/assets/main.css', css)
console.log('✓ src/assets/main.css — VisionOS design system written')

/* ─────────────────────────────────────────────────────────────
   2. App.vue  — read current, replace <style> and shell
      Strategy: only rewrite the <style> block and the
      structural wrapper elements (#sb brand, #tb, loading splash).
      All script logic is preserved as-is.
───────────────────────────────────────────────────────────── */
let app = readFileSync('./src/App.vue', 'utf8')

// ── 2a. Loading splash — ensure glass style ────────────────
app = app.replace(
  /<div v-if="booting"[^>]*>/,
  `<div v-if="booting" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;background:var(--bg)">`
)

// ── 2b. Sidebar brand block — upgrade to new VisionOS style ─
app = app.replace(
  /<div class="sb-brand">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*(?=\s*<template v-if="store\.isDesigner">)/,
  `<div class="sb-brand">
            <div class="sb-mark">PT</div>
            <div>
              <div class="sb-nm">Training Tracker</div>
              <div class="sb-sub">{{ store.role?.toUpperCase() }}</div>
            </div>
          </div>
        </div>
      </div>

      `
)

// ── 2c. Topbar — upgrade styling ──────────────────────────
app = app.replace(
  `        <header id="tb">
          <span id="tb-title">{{ pageTitle }}</span>
          <div id="tb-meta" style="display:flex !important;align-items:center;gap:10px">
            <button class="tt" @click="toggleTheme">{{ isDark ? '☀ Light' : '◑ Dark' }}</button>
            <button style="background:none;border:1px solid var(--bdr);padding:5px 10px;color:var(--t2);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.5px" @click="signOut">SIGN OUT</button>
          </div>
        </header>`,
  `        <header id="tb">
          <span id="tb-title">{{ pageTitle }}</span>
          <div id="tb-meta" style="display:flex;align-items:center;gap:8px">
            <button class="tt" @click="toggleTheme">{{ isDark ? '☀ Light' : '◑ Dark' }}</button>
          </div>
        </header>`
)

// ── 2d. Sidebar footer user row — upgrade ─────────────────
// Make the sign-out button cleaner
app = app.replace(
  `            <button style="background:none;border:none;padding:5px;color:var(--t3);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:color .13s" title="Sign out" @click="signOut" @mouseover="$event.currentTarget.style.color='var(--t1)'" @mouseleave="$event.currentTarget.style.color='var(--t3)'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>`,
  `            <button style="background:none;border:none;padding:4px;color:var(--t3);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:7px;transition:color .13s,background .13s" title="Sign out" @click="signOut" @mouseover="$event.currentTarget.style.cssText='background:var(--sur-h);border:none;padding:4px;color:var(--t1);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:7px;transition:color .13s,background .13s'" @mouseleave="$event.currentTarget.style.cssText='background:none;border:none;padding:4px;color:var(--t3);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:7px;transition:color .13s,background .13s'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>`
)

writeFileSync('./src/App.vue', app)
console.log('✓ src/App.vue   — shell updated (loading, topbar, sidebar brand)')

/* ─────────────────────────────────────────────────────────────
   DONE
───────────────────────────────────────────────────────────── */
console.log(`
╔══════════════════════════════════════════════╗
║   VisionOS redesign applied successfully!    ║
╠══════════════════════════════════════════════╣
║  Files changed:                              ║
║    src/assets/main.css                       ║
║    src/App.vue                               ║
╠══════════════════════════════════════════════╣
║  Next steps:                                 ║
║    npm run dev                               ║
╚══════════════════════════════════════════════╝
`)
