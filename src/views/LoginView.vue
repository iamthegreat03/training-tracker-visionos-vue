<template>
  <div class="lgp">
    <div class="lgb a-sc">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:22px">
        <div class="sb-mark">PT</div>
        <div>
          <div class="lg-t">Training Tracker</div>
          <div class="lg-s">Sign in to your account</div>
        </div>
      </div>

      <div v-if="error" class="al-e">{{ error }}</div>

      <div class="fg">
        <label>Email</label>
        <input id="lem" v-model="email" class="inp" type="email"
          placeholder="you@example.com" @keydown.enter="login" />
      </div>
      <div class="fg">
        <label>Password</label>
        <input id="lpw" v-model="password" class="inp" type="password"
          placeholder="••••••••" @keydown.enter="login" />
      </div>

      <button id="lbtn" class="btn btn-p" style="width:100%;margin-top:6px"
        :disabled="loading" @click="login">
        <span v-if="loading" class="spin"></span>
        <span v-else>SIGN IN</span>
      </button>

      <div class="al-i">
        ⚡ PRODUCTION TRAINING TRACKER<br>
        Contact your manager if you need access.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/lib/supabase'
import { useAppStore } from '@/stores/app'

const router   = useRouter()
const store    = useAppStore()
const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')

async function login() {
  error.value = ''
  if (!email.value || !password.value) { error.value = 'Enter email and password.'; return }
  loading.value = true
  const { data, error: err } = await db.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  })
  if (err) { error.value = err.message; loading.value = false; return }
  await store.setUser(data.user)
  await store.loadAll()
  router.push('/')
}
</script>
