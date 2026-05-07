<template>
  <div>
    <!-- Header -->
    <div class="sh">
      <div>
        <div class="sh-t">Trainings</div>
        <div class="sh-s">{{ store.trainings.length }} programs</div>
      </div>
      <button v-if="store.can('can_add_trainings')" class="btn btn-p" @click="openEditModal(null)">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>NEW TRAINING
      </button>
    </div>

    <!-- Filters -->
    <div class="cr">
      <button v-for="f in ['all', 'active', 'upcoming', 'completed']" :key="f"
        class="chip" :class="{ on: filter === f }" @click="filter = f">
        {{ f.toUpperCase() }}
      </button>
    </div>

    <!-- Trainings List -->
    <div style="display:flex;flex-direction:column;gap:1px;background:var(--bdr);border:1px solid var(--bdr)">
      <div v-if="filteredTrainings.length === 0" style="background:var(--bg);padding:40px;text-align:center">
        <div class="ec" style="color:var(--t4)">— NO TRAININGS FOUND —</div>
      </div>
      <div v-for="t in filteredTrainings" :key="t.id" 
           style="background:var(--bg);padding:18px 22px;display:flex;align-items:flex-start;gap:18px;transition:background .12s;cursor:pointer"
           @mouseover="$event.currentTarget.style.background='var(--sur-h)'"
           @mouseout="$event.currentTarget.style.background='var(--bg)'"
           @click="openDetailModal(t)">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px;flex-wrap:wrap">
            <span style="font-size:14px;color:var(--t1)">{{ t.name }}</span>
            <span v-if="t.type === 'Discussion'" class="tag tag-b">DISCUSSION</span>
            <span v-else class="tag tag-a">HANDS-ON</span>
            <span v-if="t.status === 'completed'" class="tag tag-g">COMPLETED</span>
            <span v-else-if="t.status === 'upcoming'" class="tag tag-a">UPCOMING</span>
            <span v-else class="tag tag-b">ACTIVE</span>
          </div>
          <div style="display:flex;gap:18px;font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;flex-wrap:wrap;margin-bottom:10px">
            <span v-if="t.start_date || t.target_date">{{ fmtDs(t.start_date) }} → {{ fmtDs(t.target_date) }}</span>
            <span>{{ (t.schedule || []).map(d => d.slice(0,3).toUpperCase()).join('·') || '—' }}</span>
            <span>{{ enrolledCount(t.id) }} ENROLLED</span>
            <span>{{ sessHeld(t.id) }}/{{ sessTotal(t.id) }} SESSIONS</span>
            <span v-if="t.platform">{{ t.platform }}</span>
            <span v-if="t.type !== 'Discussion' && t.skill_name" style="color:var(--g)">▸ {{ t.skill_name }} {{ t.skill_level || '' }}</span>
            <span v-if="t.type === 'Discussion' && t.topic" style="color:var(--bl)">▸ {{ t.topic }}</span>
            <span v-if="t.type === 'Discussion' && t.facilitator" style="color:var(--t3)">· {{ t.facilitator }}</span>
          </div>
          
          <div class="prog" style="max-width:200px">
            <div class="pt"><div class="pf" :style="{ width: tRate(t.id) + '%' }"></div></div>
            <div class="pl">{{ tRate(t.id) }}%</div>
          </div>
        </div>
        
        <div style="display:flex;gap:7px;flex-shrink:0" @click.stop>
          <button v-if="store.can('can_add_trainings')" class="btn btn-g btn-sm" @click="openEditModal(t)">EDIT</button>
          <button v-if="store.can('can_delete_trainings')" class="btn btn-d btn-sm" @click="confirmDelete(t)">DEL</button>
        </div>
      </div>
    </div>

    <!-- Modals go here -->
    
    <!-- Detail Modal -->
    <AppModal v-model="showDetail" :title="`TRAINING // ${selT?.name?.toUpperCase()}`" large>
      <template v-if="selT">
        <!-- Header info -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-bottom:16px;border-bottom:1px solid var(--bdr);margin-bottom:16px">
          <div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">TYPE / PLATFORM</div>
            <div style="display:flex;gap:6px;align-items:center">
              <span v-if="selT.type === 'Discussion'" class="tag tag-b">DISCUSSION</span><span v-else class="tag tag-a">HANDS-ON</span>
              <span v-if="selT.platform" style="font-size:11px;color:var(--t3);font-family:'JetBrains Mono',monospace">{{ selT.platform }}</span>
            </div>
          </div>
          <div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">STATUS</div>
            <span v-if="selT.status === 'completed'" class="tag tag-g">COMPLETED</span>
            <span v-else-if="selT.status === 'upcoming'" class="tag tag-a">UPCOMING</span>
            <span v-else class="tag tag-b">ACTIVE</span>
          </div>
          <div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">SCHEDULE</div>
            <div style="font-size:12px;color:var(--t2);font-family:'JetBrains Mono',monospace">{{ detailCombinedSchedule }}</div>
          </div>
          <div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">DATES</div>
            <div style="font-size:12px;color:var(--t2);font-family:'JetBrains Mono',monospace">{{ fmtDs(selT.start_date) }} → {{ fmtDs(selT.target_date) }}</div>
          </div>
          
          <!-- Type specific details -->
          <template v-if="selT.type === 'Discussion'">
            <div v-if="selT.topic"><div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">TOPIC / AGENDA</div><div style="font-size:12px;color:var(--t2)">{{ selT.topic }}</div></div>
            <div v-if="selT.facilitator"><div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">FACILITATOR</div><div style="font-size:12px;color:var(--t2)">{{ selT.facilitator }}</div></div>
            <div v-if="selT.resources_url"><div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">RESOURCES</div><a :href="selT.resources_url" target="_blank" style="font-size:12px;color:var(--bl);text-decoration:none">↗ View Resources</a></div>
          </template>
          <template v-else>
            <div v-if="selT.skill_name">
              <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">SKILL AWARDED</div>
              <div style="font-size:12px;font-family:'JetBrains Mono',monospace;color:var(--g)">{{ selT.skill_name }} — {{ selT.skill_level || '—' }}</div>
            </div>
          </template>
          
          <div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:4px">SESSIONS</div>
            <div style="font-size:12px;color:var(--t2);font-family:'JetBrains Mono',monospace">{{ sessHeld(selT.id) }} HELD / {{ sessTotal(selT.id) }} TOTAL</div>
          </div>
        </div>

        <!-- Attendance Rate -->
        <div style="margin-bottom:16px">
          <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:6px">OVERALL ATTENDANCE RATE</div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="font-size:32px;font-weight:300;font-family:'JetBrains Mono',monospace" :style="{ color: tRate(selT.id) >= 80 ? 'var(--g)' : tRate(selT.id) >= 60 ? 'var(--a)' : 'var(--r)' }">{{ tRate(selT.id) }}%</div>
            <div class="prog" style="flex:1;max-width:300px">
              <div class="pt"><div class="pf" :style="{ width: tRate(selT.id) + '%' }"></div></div>
            </div>
          </div>
        </div>

        <!-- Enrolled Designers -->
        <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:8px;letter-spacing:.6px">ENROLLED DESIGNERS — {{ detailEnrolled.length }}</div>
        <div style="border:1px solid var(--bdr);margin-bottom:16px;max-height:180px;overflow-y:auto">
          <div v-if="detailEnrolled.length === 0" class="empty"><div class="ec">NONE</div></div>
          <div v-for="d in detailEnrolled" :key="d.id" style="display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid var(--bdr-s)">
            <div style="width:20px;height:20px;background:var(--sur-h);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:8px;font-family:'JetBrains Mono',monospace;color:var(--t3);flex-shrink:0">{{ init(d.name) }}</div>
            <div style="flex:1"><div style="font-size:13px;color:var(--t1)">{{ d.name }}</div><div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">{{ d.team || '—' }} · {{ detailDesignerSchedule(d.id) }}</div></div>
            
            <template v-if="getDesRate(selT.id, d.id) !== null">
              <div class="prog" style="width:80px">
                <div class="pt"><div class="pf" :style="{ width: getDesRate(selT.id, d.id) + '%' }"></div></div>
                <div class="pl">{{ getDesRate(selT.id, d.id) }}%</div>
              </div>
            </template>
            <span v-else style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace">NO DATA</span>
          </div>
        </div>

        <!-- Sessions List -->
        <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:8px;letter-spacing:.6px">SESSIONS</div>
        <div style="border:1px solid var(--bdr);max-height:180px;overflow-y:auto">
          <div v-if="detailSessions.length === 0" class="empty"><div class="ec">NO SESSIONS YET</div></div>
          <div v-for="s in detailSessions" :key="s.id" style="display:flex;align-items:center;gap:12px;padding:8px 14px;border-bottom:1px solid var(--bdr-s)" :style="{ opacity: s.session_date > TODAY ? '0.5' : '1' }">
            <span style="font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--t2);min-width:60px" :style="{ color: s.session_date > TODAY ? 'var(--t4)' : 'var(--t2)' }">{{ fmtDs(s.session_date).toUpperCase() }}</span>
            <span style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;flex:1">{{ s.session_date > TODAY ? 'SCHEDULED' : 'HELD' }}</span>
            <template v-if="s.session_date <= TODAY">
              <span style="font-size:10px;color:var(--g);font-family:'JetBrains Mono',monospace">+{{ sessStats(s.id).pr }}</span>
              <span style="font-size:10px;color:var(--r);font-family:'JetBrains Mono',monospace">-{{ sessStats(s.id).ab }}</span>
            </template>
            <a v-if="s.proof_url" :href="s.proof_url" target="_blank" style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--bl);text-decoration:none;border:1px solid rgba(96,165,250,.3);padding:1px 6px">PROOF ↗</a>
          </div>
        </div>
      </template>

      <template #footer>
        <button class="btn btn-g" @click="showDetail = false">CLOSE</button>
        <button v-if="selT?.status === 'completed' && (selT.type === 'Discussion' || (selT.skill_name && selT.skill_level))" class="btn btn-a btn-sm" @click="openAssessModal()">
          ⭐ ASSESS & {{ selT.type === 'Discussion' ? 'RECORD SKILL GAP' : 'AWARD SKILLS' }}
        </button>
        <RouterLink v-if="selT" :to="{ name: 'attendance' }">
          <button class="btn btn-p">GO TO ATTENDANCE →</button>
        </RouterLink>
      </template>
    </AppModal>

    <!-- Assess Modal -->
    <AppModal v-model="showAssess" :title="`ASSESS & ${selT?.type === 'Discussion' ? 'RECORD SKILL GAP' : 'AWARD'} // ${selT?.name?.toUpperCase()}`">
      <div style="border:1px solid rgba(251,191,36,.25);background:var(--a-bg);padding:10px 14px;margin-bottom:16px;font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--a)">
        ⭐ <span v-if="selT?.type === 'Discussion'">Mark designers who <strong>completed</strong> this discussion. They will be recorded under <strong>Designer Skill Gap → {{ selT?.name }}</strong> in the Skill Set tab.</span>
        <span v-else>Mark designers who PASSED this training. Selected designers will have <strong>{{ selT?.skill_name }}</strong> added to their Skill Set.</span>
      </div>

      <div v-if="selT?.type !== 'Discussion'" class="f2" style="margin-bottom:14px">
        <div class="fg"><label>Skill / Platform</label><input v-model="assPlatform" class="inp" placeholder="Platform name"/></div>
        <div class="fg">
          <label>Level Awarded</label>
          <select v-model="assLevel" class="sel">
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
      </div>

      <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:8px;letter-spacing:.6px">ENROLLED DESIGNERS — check those who COMPLETED</div>
      <div style="border:1px solid var(--bdr);max-height:260px;overflow-y:auto">
        <label v-for="d in detailEnrolled" :key="d.id" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--bdr-s);cursor:pointer;transition:background .09s" @mouseover="$event.currentTarget.style.background='var(--sur-h)'" @mouseout="$event.currentTarget.style.background=''">
          <input type="checkbox" v-model="assChecked[d.id]" style="width:15px;height:15px;cursor:pointer;flex-shrink:0"/>
          <div style="width:20px;height:20px;background:var(--sur-h);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:8px;font-family:'JetBrains Mono',monospace;color:var(--t3);flex-shrink:0">{{ init(d.name) }}</div>
          <div style="flex:1">
            <div style="font-size:13px;color:var(--t1)">{{ d.name }}</div>
            <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">{{ d.team || '—' }} · {{ getDesRate(selT?.id, d.id) !== null ? getDesRate(selT?.id, d.id) + '% attendance' : 'No data' }}</div>
          </div>
          <span v-if="assChecked[d.id]" style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--g);border:1px solid rgba(74,222,128,.3);padding:2px 6px">{{ selT?.type === 'Discussion' ? 'DONE' : 'PASS' }}</span>
          <span v-else style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--t4);border:1px solid var(--bdr);padding:2px 6px">—</span>
        </label>
      </div>

      <template #footer>
        <button class="btn btn-g" @click="showAssess = false">CANCEL</button>
        <button class="btn btn-p" :disabled="saving" @click="saveAssessment">
          <span v-if="saving" class="spin"></span><span v-else>{{ selT?.type === 'Discussion' ? 'RECORD SKILL GAP' : 'AWARD SKILLS' }}</span>
        </button>
      </template>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal v-model="confirmDelForm" title="DELETE TRAINING">
       <div class="al-e">Are you sure? This deletes the training and ALL related attendance records.</div>
       <template #footer>
          <button class="btn btn-g" @click="confirmDelForm = false">CANCEL</button>
          <button class="btn btn-d" :disabled="saving" @click="delTraining">DELETE</button>
       </template>
    </AppModal>

    <!-- Edit/New Modal (Very large) -->
    <AppModal v-model="showEdit" :title="editT.id ? 'EDIT TRAINING' : 'NEW TRAINING'" large>
      <!-- Type selector -->
      <div class="fg">
        <label>Type</label>
        <div style="display:flex;gap:8px">
          <button class="chip" :class="{ on: editT.type === 'Hands-On' }" style="flex:1;padding:10px;font-size:11px" @click="setEditType('Hands-On')">Hands-On</button>
          <button class="chip" :class="{ on: editT.type === 'Discussion' }" style="flex:1;padding:10px;font-size:11px" @click="setEditType('Discussion')">Discussion</button>
        </div>
      </div>
      <div class="dvd" style="margin:12px 0"></div>
      
      <div class="fg">
        <label>Training Name</label>
        <input v-model="editT.name" class="inp" :placeholder="editT.type === 'Discussion' ? 'e.g. GHL Theme Setup Discussion' : 'e.g. GoHighLevel Hands-On Training'"/>
      </div>

      <template v-if="editT.type === 'Hands-On'">
        <div class="f2">
          <div class="fg">
            <label>Platform / Skill</label>
            <select v-model="editT.platformSelect" class="sel">
              <option value="">— Select platform —</option>
              <option v-for="pl in knownPlatforms" :key="pl" :value="pl">{{ pl }}</option>
              <option value="__new__">+ New platform…</option>
            </select>
            <input v-if="editT.platformSelect === '__new__'" v-model="editT.platform" class="inp" style="margin-top:6px" placeholder="Type new platform name…"/>
          </div>
        </div>
        <div class="f2">
          <div class="fg">
            <label>Skill Set Name <span style="color:var(--t4);font-size:9px">(awarded on completion)</span></label>
            <input v-model="editT.skill_name" class="inp" placeholder="e.g. GoHighLevel, Framer…"/>
          </div>
          <div class="fg">
            <label>Level Awarded</label>
            <select v-model="editT.skill_level" class="sel">
              <option value="">— None —</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      </template>

      <template v-if="editT.type === 'Discussion'">
        <div class="fg"><label>Topic / Agenda</label><input v-model="editT.topic" class="inp" placeholder="e.g. Proper way of building funnels, Automation Logic…"/></div>
        <div class="f2">
          <div class="fg"><label>Facilitator</label><input v-model="editT.facilitator" class="inp" placeholder="e.g. Jamaica Daig, External Speaker…"/></div>
          <div class="fg"><label>Resources / Link</label><input v-model="editT.resources_url" class="inp" placeholder="https://drive.google.com/…"/></div>
        </div>
      </template>

      <div class="f2" v-if="editT.type === 'Hands-On'">
        <div class="fg"><label>Start Date</label><input v-model="editT.start_date" type="date" class="inp"/></div>
        <div class="fg"><label>Target Finish</label><input v-model="editT.target_date" type="date" class="inp"/></div>
      </div>

      <div v-if="editT.id" class="fg">
        <label>Status</label>
        <select v-model="editT.status" class="sel">
          <option value="upcoming">upcoming</option>
          <option value="active">active</option>
          <option value="completed">completed</option>
        </select>
      </div>

      <!-- Schedule -->
      <div class="fg">
        <template v-if="editT.type === 'Discussion'">
          <label>Session Dates <span style="color:var(--t4);font-size:9px">(add each date individually)</span></label>
          <div style="display:flex;gap:8px;margin-bottom:8px">
            <input v-model="editT.discDate" type="date" class="inp" style="flex:1" @keydown.enter.prevent="addDiscDate"/>
            <button class="btn btn-p btn-sm" style="flex-shrink:0" @click="addDiscDate">+ ADD DATE</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;min-height:32px">
            <span v-if="!editT.schedule.length" style="font-size:10px;color:var(--t4);font-family:'JetBrains Mono',monospace">No dates added yet</span>
            <span v-for="d in editT.schedule" :key="d" style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:var(--accent-t, rgba(249,115,22,.1));border:1px solid rgba(249,115,22,.3);border-radius:4px;font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--accent, #f97316)">
              {{ fmtDs(d).toUpperCase() }}
              <button @click="removeDiscDate(d)" style="background:none;border:none;color:inherit;cursor:pointer;font-size:12px;padding:0;line-height:1">✕</button>
            </span>
          </div>
        </template>
        <template v-else>
          <label>Training Days</label>
          <div class="dcs">
            <button v-for="d in DAYS" :key="d" class="dc" :class="{ on: editT.schedule.includes(d) }" @click="toggleEditSched(d)">
              {{ d.slice(0,3).toUpperCase() }}
            </button>
          </div>
        </template>
      </div>

      <div class="dvd"></div>

      <!-- Enrollments -->
      <div class="fg">
        <label>Enroll Designers & Set Their Days <span style="color:var(--t4);text-transform:none;font-size:9px">({{ Object.keys(editT.enrollSel).length }} enrolled)</span></label>
        <div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace;margin-bottom:9px">Toggle checkbox to enroll, then set which days each designer attends.</div>
        
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          <button class="chip" :class="{ on: editT.teamFilter === 'all' }" @click="editT.teamFilter = 'all'">ALL</button>
          <button v-for="tm in S_teams" :key="tm" class="chip" :class="{ on: editT.teamFilter === tm }" @click="editT.teamFilter = tm">
            {{ tm.toUpperCase() }}
          </button>
        </div>
        <input v-model="editT.searchFilter" class="inp" placeholder="Search name…" style="margin-bottom:8px;padding:7px 11px"/>

        <div class="el">
          <div v-for="d in filteredEnrollDesigners" :key="d.id">
            <div v-if="hasAcquiredTargetSkill(d.id)" class="ei" style="opacity:.45;cursor:not-allowed">
              <div style="display:flex;align-items:center;gap:0;flex:1;padding:2px 0">
                <div class="ecb" style="border-color:var(--bdr-s);background:transparent"></div>
                <div style="width:20px;height:20px;background:var(--sur-h);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:8px;font-family:'JetBrains Mono',monospace;color:var(--t3);flex-shrink:0;margin-right:9px">{{ init(d.name) }}</div>
                <div class="ei-info">
                  <div style="font-size:13px;color:var(--t2)">{{ d.name }}</div>
                  <div style="font-size:9px;color:var(--g);font-family:'JetBrains Mono',monospace">✓ SKILL ALREADY ACQUIRED</div>
                </div>
              </div>
              <div style="padding:0 12px"><span style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--g);border:1px solid rgba(74,222,128,.3);padding:2px 7px">ACQUIRED</span></div>
            </div>
            
            <div v-else class="ei" :class="{ sel: editT.enrollSel[d.id] !== undefined }">
              <div style="display:flex;align-items:center;gap:0;flex:1" @click="toggleEnroll(d.id)">
                <div class="ecb"></div>
                <div style="width:20px;height:20px;background:var(--sur-h);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:8px;font-family:'JetBrains Mono',monospace;color:var(--t3);flex-shrink:0;margin-right:9px">{{ init(d.name) }}</div>
                <div class="ei-info"><div style="font-size:13px;color:var(--t1)">{{ d.name }}</div><div style="font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">{{ d.team || '—' }} · {{ d.rank || '—' }}</div></div>
              </div>

              <div v-if="editT.enrollSel[d.id] !== undefined" class="ei-days">
                <button v-for="item in editT.type === 'Discussion' ? editT.schedule : DAYS" :key="item" 
  class="ddb" :class="{ on: editT.enrollSel[d.id].includes(item) }"
  :disabled="!editT.schedule.includes(item)"
  :style="{ opacity: editT.schedule.includes(item) ? 1 : 0.2, cursor: editT.schedule.includes(item) ? 'pointer' : 'not-allowed', pointerEvents: editT.schedule.includes(item) ? 'auto' : 'none', minWidth: editT.type === 'Discussion' ? '48px' : '32px' }"
  :title="editT.type === 'Discussion' ? fmtDs(item) : item"
  @click="toggleEnrollDay(d.id, item)">
                  {{ editT.type === 'Discussion' ? fmtDs(item).toUpperCase() : item.slice(0,3).toUpperCase() }}
                </button>
              </div>
              <div v-else style="padding:0 12px;font-size:9px;color:var(--t4);font-family:'JetBrains Mono',monospace">CLICK TO ENROLL</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-g" @click="showEdit = false">CANCEL</button>
        <button class="btn btn-p" :disabled="saving" @click="saveTraining">
          <span v-if="saving" class="spin"></span><span v-else>SAVE TRAINING</span>
        </button>
      </template>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { db } from '@/lib/supabase'
import { pct, fmtDs, init, TODAY, DAYS, PLATFORMS } from '@/lib/utils'
import AppModal from '@/components/AppModal.vue'

const store = useAppStore()

const filter = ref('all')

const filteredTrainings = computed(() => {
  if (filter.value === 'all') return store.trainings
  return store.trainings.filter(t => t.status === filter.value)
})

// Lists stats
function enrolledCount(tid) { return store.enrollments.filter(e => e.training_id === tid).length }
function sessHeld(tid) { return store.sessions.filter(s => s.training_id === tid && s.session_date <= TODAY).length }
function sessTotal(tid) { return store.sessions.filter(s => s.training_id === tid).length }
function tRate(tid) {
  const tS = store.sessions.filter(s => s.training_id === tid)
  const enr = store.enrollments.filter(e => e.training_id === tid).map(e => e.designer_id)
  const tA = store.attendance.filter(a => tS.some(s => s.id === a.session_id) && enr.includes(a.designer_id) && a.is_present !== null)
  return tA.length > 0 ? pct(tA.filter(a => a.is_present === true).length, tA.length) : 0
}

function getDesRate(tid, did) {
  const tS = store.sessions.filter(s => s.training_id === tid)
  const mk = store.attendance.filter(a => tS.some(s => s.id === a.session_id) && a.designer_id === did && a.is_present !== null)
  return mk.length > 0 ? pct(mk.filter(a => a.is_present === true || a.is_present === 'late').length, mk.length) : null
}

// ── Detail Modal ───────────────────────────────────────────────
const showDetail = ref(false)
const selT = ref(null)

const detailSessions = computed(() => selT.value ? store.sessions.filter(s => s.training_id === selT.value.id).sort((a,b) => new Date(a.session_date) - new Date(b.session_date)) : [])
const detailEnrRows = computed(() => selT.value ? store.enrollments.filter(e => e.training_id === selT.value.id) : [])
const detailEnrolled = computed(() => {
  const ids = detailEnrRows.value.map(e => e.designer_id)
  return store.designers.filter(d => ids.includes(d.id))
})
const detailCombinedSchedule = computed(() => {
  const allDays = [...new Set(detailEnrRows.value.flatMap(e => e.designer_schedule || []))].sort((a,b) => DAYS.indexOf(a) - DAYS.indexOf(b))
  if (allDays.length) return allDays.map(d => d.slice(0,3).toUpperCase()).join(' · ')
  if (selT.value?.schedule?.length) return selT.value.schedule.map(d => d.slice(0,3).toUpperCase()).join(' · ')
  return '—'
})
function detailDesignerSchedule(did) {
  const r = detailEnrRows.value.find(e => e.designer_id === did)
  const d = r?.designer_schedule || []
  return d.length ? d.map(x => x.slice(0,3).toUpperCase()).join('·') : 'ALL DAYS'
}
function sessStats(sid) {
  const sA = store.attendance.filter(a => a.session_id === sid)
  return {
    pr: sA.filter(a => a.is_present === true).length,
    ab: sA.filter(a => a.is_present === false).length
  }
}

function openDetailModal(t) {
  selT.value = t
  showDetail.value = true
}

// ── Assess Modal ───────────────────────────────────────────────
const showAssess = ref(false)
const assPlatform = ref('')
const assLevel = ref('Intermediate')
const assChecked = ref({})

function openAssessModal() {
  assPlatform.value = selT.value?.skill_name || ''
  assLevel.value = selT.value?.skill_level || 'Intermediate'
  assChecked.value = {}
  
  detailEnrolled.value.forEach(d => {
    // Check if they attended ANY session
    const attended = store.attendance.some(a => 
      detailSessions.value.some(s => s.id === a.session_id) && 
      a.designer_id === d.id && 
      (a.is_present === true || a.is_present === 'late')
    )
    assChecked.value[d.id] = attended
  })
  
  showAssess.value = true
}

const saving = ref(false)

async function saveAssessment() {
  const isDisc = selT.value?.type === 'Discussion'
  const platform = isDisc ? `DSG: ${selT.value.name}` : assPlatform.value.trim()
  const level = isDisc ? 'Completed' : assLevel.value

  if (!isDisc && (!platform || !level)) return

  saving.value = true
  const upserts = []
  for (const d of detailEnrolled.value) {
    if (assChecked.value[d.id]) {
      upserts.push({
        designer_id: d.id, platform, level, source: selT.value.name, updated_at: new Date().toISOString()
      })
    }
  }

  if (upserts.length) {
    await db.from('designer_skills').upsert(upserts, { onConflict: 'designer_id,platform' })
  }
  
  if (!isDisc && (selT.value.skill_name !== platform || selT.value.skill_level !== level)) {
    await db.from('trainings').update({ skill_name: platform, skill_level: level }).eq('id', selT.value.id)
  }

  showAssess.value = false
  await store.loadAll()
  saving.value = false
  showDetail.value = false
}

// ── Delete Training ────────────────────────────────────────────
const confirmDelForm = ref(false)
const delTarget = ref(null)

function confirmDelete(t) {
  delTarget.value = t
  confirmDelForm.value = true
}

async function delTraining() {
  if (!delTarget.value) return
  saving.value = true
  await db.from('trainings').delete().eq('id', delTarget.value.id)
  confirmDelForm.value = false
  await store.loadAll()
  saving.value = false
}

// ── Edit / New Modal ───────────────────────────────────────────
const showEdit = ref(false)
const S_teams = computed(() => [...new Set(store.designers.map(d => d.team).filter(Boolean))].sort())

const knownPlatforms = computed(() => {
  return [...new Set([
    ...PLATFORMS, 
    ...store.trainings.map(t => t.platform).filter(Boolean),
    ...store.designerSkills.map(s => s.platform).filter(Boolean)
  ])].sort()
})

const editT = ref({
  id: null,
  name: '',
  type: 'Hands-On',
  platformSelect: '',
  platform: '',
  skill_name: '',
  skill_level: '',
  topic: '',
  facilitator: '',
  resources_url: '',
  start_date: '',
  target_date: '',
  status: 'upcoming',
  schedule: [],
  discDate: '',
  enrollSel: {},
  teamFilter: 'all',
  searchFilter: ''
})

function openEditModal(t) {
  const e = {
    id: t?.id || null,
    name: t?.name || '',
    type: t?.type || 'Hands-On',
    platformSelect: knownPlatforms.value.includes(t?.platform) ? t.platform : (t?.platform ? '__new__' : ''),
    platform: knownPlatforms.value.includes(t?.platform) ? '' : (t?.platform || ''),
    skill_name: t?.skill_name || '',
    skill_level: t?.skill_level || '',
    topic: t?.topic || '',
    facilitator: t?.facilitator || '',
    resources_url: t?.resources_url || '',
    start_date: t?.start_date || '',
    target_date: t?.target_date || '',
    status: t?.status || 'upcoming',
    schedule: t?.schedule ? [...t.schedule] : [],
    discDate: '',
    enrollSel: {},
    teamFilter: 'all',
    searchFilter: ''
  }
  
  if (t) {
    const enrs = store.enrollments.filter(x => x.training_id === t.id)
    enrs.forEach(en => { e.enrollSel[en.designer_id] = en.designer_schedule || [] })
  }
  
  editT.value = e
  showEdit.value = true
}

function setEditType(ty) {
  editT.value.type = ty
  editT.value.schedule = [] // Clear schedule when switching types
}

function addDiscDate() {
  if (!editT.value.discDate) return
  if (!editT.value.schedule.includes(editT.value.discDate)) {
    editT.value.schedule.push(editT.value.discDate)
    editT.value.schedule.sort()
  }
  editT.value.discDate = ''
}
function removeDiscDate(d) {
  editT.value.schedule = editT.value.schedule.filter(x => x !== d)
}
function toggleEditSched(d) {
  const idx = editT.value.schedule.indexOf(d)
  if (idx > -1) editT.value.schedule.splice(idx, 1)
  else editT.value.schedule.push(d)
}

const computedSkillTarget = computed(() => {
  const name = editT.value.type === 'Discussion' ? '' : (editT.value.skill_name || editT.value.platformSelect === '__new__' ? editT.value.platform : editT.value.platformSelect || '').trim().toLowerCase()
  return { name, level: editT.value.skill_level }
})

const levelOrder = { Intermediate: 1, Advanced: 2, Expert: 3 }

function hasAcquiredTargetSkill(did) {
  const { name, level } = computedSkillTarget.value
  const targetLvl = levelOrder[level] || 0
  if (!name || targetLvl === 0) return false
  
  return store.designerSkills.some(s => 
    s.designer_id === did &&
    s.platform.toLowerCase() === name &&
    (levelOrder[s.level] || 0) >= targetLvl
  )
}

const filteredEnrollDesigners = computed(() => {
  const q = editT.value.searchFilter.toLowerCase()
  return store.designers.filter(d => {
    if (editT.value.teamFilter !== 'all' && d.team !== editT.value.teamFilter) return false
    if (q && !d.name.toLowerCase().includes(q)) return false
    return true
  }).sort((a,b) => a.name.localeCompare(b.name))
})

function toggleEnroll(did) {
  if (hasAcquiredTargetSkill(did)) return
  if (editT.value.enrollSel[did] !== undefined) {
    delete editT.value.enrollSel[did]
  } else {
    editT.value.enrollSel[did] = [...editT.value.schedule]
  }
}

function toggleEnrollDay(did, day) {
  const arr = editT.value.enrollSel[did]
  if (!arr) return
  const idx = arr.indexOf(day)
  if (idx > -1) arr.splice(idx, 1)
  else arr.push(day)
}

async function saveTraining() {
  if (!editT.value.name) return
  saving.value = true
  
  const pl = {
    name: editT.value.name,
    type: editT.value.type,
    platform: editT.value.type === 'Hands-On' ? (editT.value.platformSelect === '__new__' ? editT.value.platform : editT.value.platformSelect) || null : null,
    skill_name: editT.value.type === 'Hands-On' ? editT.value.skill_name || null : null,
    skill_level: editT.value.type === 'Hands-On' ? editT.value.skill_level || null : null,
    topic: editT.value.type === 'Discussion' ? editT.value.topic || null : null,
    facilitator: editT.value.type === 'Discussion' ? editT.value.facilitator || null : null,
    resources_url: editT.value.type === 'Discussion' ? editT.value.resources_url || null : null,
    start_date: editT.value.type === 'Hands-On' ? editT.value.start_date || null : null,
    target_date: editT.value.type === 'Hands-On' ? editT.value.target_date || null : null,
    status: editT.value.status,
    schedule: editT.value.schedule
  }

  let tid = editT.value.id
  if (tid) {
    await db.from('trainings').update(pl).eq('id', tid)
  } else {
    const { data } = await db.from('trainings').insert(pl).select()
    tid = data?.[0]?.id
  }

  if (tid) {
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
}

</script>
