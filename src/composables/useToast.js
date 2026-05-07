// src/composables/useToast.js
// Global toast system matching legacy toast() behavior
// Usage: const { toast } = useToast()
//   toast('Saved')               → green ok toast
//   toast('Error', 'er')         → red error toast
//   toast('Marked', 'ok', cb)    → amber undo toast with callback

import { ref } from 'vue'

const toasts = ref([])
let _id = 0

export function useToast() {
  function toast(msg, type = 'ok', undoCb = null, undoLabel = 'UNDO') {
    const id = ++_id
    const t = { id, msg, type, undoCb, undoLabel }
    toasts.value.push(t)
    const delay = undoCb ? 5000 : 3600
    setTimeout(() => remove(id), delay)
  }

  function remove(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function doUndo(t) {
    if (t.undoCb) t.undoCb()
    remove(t.id)
  }

  return { toasts, toast, remove, doUndo }
}
