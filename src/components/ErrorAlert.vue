<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
// import type { ErrorProps } from '../types'

const props = defineProps<{
  message?: string
  type?: 'error' | 'warning' | 'success' | 'info'
  autoClose?: boolean
  duration?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const defaultDuration = 5000 // 5 seconds
let autoCloseTimeout: number | undefined

const alertClasses = computed(() => {
  const baseClasses =
    'text-sm flex justify-between w-full p-3 mt-2 transition-all duration-300'

  const typeClasses = {
    error: 'border-red-600 bg-red-100 text-red-600',
    warning: 'border-yellow-600 bg-yellow-100 text-yellow-600',
    success: 'border-green-600 bg-green-100 text-green-600',
    info: 'border-blue-600 bg-blue-100 text-blue-600',
  }

  return `${baseClasses} ${typeClasses[props.type || 'error']}`
})

const closeAlert = () => {
  emit('close')
}

onMounted(() => {
  if (props.autoClose) {
    autoCloseTimeout = window.setTimeout(() => {
      closeAlert()
    }, props.duration || defaultDuration)
  }
})

onBeforeUnmount(() => {
  if (autoCloseTimeout) {
    clearTimeout(autoCloseTimeout)
  }
})
</script>

<template>
  <Transition name="fade">
    <div v-if="message" :class="alertClasses">
      <p class="w-[90%]">{{ message }}</p>
      <button
        class="cursor-pointer underline font-semibold hover:opacity-80"
        @click="closeAlert"
        type="button"
      >
        Close
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
