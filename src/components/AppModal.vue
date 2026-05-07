<template>
  <div v-if="modelValue" class="bkd" @click.self="close">
    <div class="mdl" :class="{ 'mdl-lg': large }">
      <div class="mdl-hd">
        <div class="mdl-t">{{ title }}</div>
      </div>
      <div class="mdl-bd">
        <slot></slot>
      </div>
      <div class="mdl-ft" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  large: Boolean
})

const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleEsc(e) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEsc)
  // Prevent background scroll on iOS when modal is open
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc)
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
})
</script>
