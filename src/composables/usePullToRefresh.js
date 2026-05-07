// src/composables/usePullToRefresh.js
// Mobile pull-to-refresh matching legacy initPullToRefresh()
// Usage: usePullToRefresh(scrollEl, onRefresh)
//   scrollEl — ref to the scrollable #main element
//   onRefresh — async function to call on release (e.g. store.loadAll)

import { ref, onMounted, onUnmounted } from 'vue'

export function usePullToRefresh(scrollElId, onRefresh) {
  const ptrState = ref('idle') // idle | pulling | release | refreshing
  const ptrDy = ref(0)
  const THRESHOLD = 70

  let startY = 0
  let pulling = false

  function getEl() {
    return document.getElementById(scrollElId)
  }

  function onTouchStart(e) {
    const el = getEl()
    if (el && el.scrollTop === 0) {
      startY = e.touches[0].clientY
    }
  }

  function onTouchMove(e) {
    if (!startY) return
    const dy = e.touches[0].clientY - startY
    const el = getEl()
    if (dy > 20 && el && el.scrollTop === 0) {
      pulling = true
      ptrDy.value = dy
      ptrState.value = dy > THRESHOLD ? 'release' : 'pulling'
    }
  }

  async function onTouchEnd() {
    if (!pulling) { startY = 0; return }
    pulling = false
    startY = 0
    ptrDy.value = 0

    if (ptrState.value === 'release') {
      ptrState.value = 'refreshing'
      await onRefresh()
    }
    ptrState.value = 'idle'
  }

  onMounted(() => {
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd)
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchmove', onTouchMove)
    document.removeEventListener('touchend', onTouchEnd)
  })

  return { ptrState, ptrDy, THRESHOLD }
}
