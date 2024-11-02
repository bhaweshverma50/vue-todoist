import { ref } from 'vue'
import type { ErrorProps } from '@/types'

export const useAlert = () => {
  const alert = ref<ErrorProps | null>(null)

  const showAlert = (options: ErrorProps) => {
    alert.value = options
  }

  const clearAlert = () => {
    alert.value = null
  }

  return {
    alert,
    showAlert,
    clearAlert,
  }
}
