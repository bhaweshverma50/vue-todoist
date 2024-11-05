<script setup lang="ts">
import { computed } from 'vue'
import type { ToDos } from '@/types'

const props = defineProps<{
  todo: ToDos
  editingId: string | null
  modelValue: string
}>()

const emit = defineEmits<{
  'start-edit': [todo: ToDos]
  'save-edit': [todo: ToDos]
  'cancel-edit': []
  'update-status': [todo: ToDos]
  'delete-todo': [id: string]
  'update:modelValue': [value: string]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-600',
  'in-progress': 'bg-blue-100 text-blue-800 border border-blue-600',
  completed: 'bg-green-100 text-green-800 border border-green-600',
} as const

const statusTransitions = {
  pending: 'in-progress',
  'in-progress': 'completed',
  completed: 'pending',
} as const

const getStatusIcon = (status: ToDos['status']) => {
  switch (status) {
    case 'pending':
      return 'pi-clock'
    case 'in-progress':
      return 'pi-spin pi-spinner'
    case 'completed':
      return 'pi-check-circle'
    default:
      return 'pi-clock'
  }
}

const formatDate = (dateString: string | Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateString instanceof Date ? dateString : new Date(dateString))
}

const handleKeyDown = (e: KeyboardEvent, todo: ToDos) => {
  if (e.key === 'Escape') {
    emit('cancel-edit')
  } else if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('save-edit', todo)
  }
}
</script>

<template>
  <div
    class="group p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-200 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
    >
      <div class="flex-1 space-y-2">
        <div class="flex flex-col gap-2">
          <div
            class="px-2 py-1 text-[8px] font-bold rounded-sm w-fit"
            :class="statusColors[todo.status]"
          >
            {{ todo.status.toUpperCase() }}
          </div>
          <div class="space-x-2">
            <!-- Edit Mode -->
            <div v-if="editingId === todo.id" class="flex-1">
              <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
                <input
                  v-model="inputValue"
                  type="text"
                  class="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  @keydown="e => handleKeyDown(e, todo)"
                />
                <div class="flex space-x-2">
                  <button
                    class="p-1 text-green-600 hover:text-green-700 focus:outline-none"
                    @click="$emit('save-edit', todo)"
                    title="Save changes"
                  >
                    <i class="pi pi-check" />
                  </button>
                  <button
                    class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    @click="$emit('cancel-edit')"
                    title="Cancel editing"
                  >
                    <i class="pi pi-times" />
                  </button>
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-400">
                Press Enter to save, Esc to cancel
              </p>
            </div>

            <!-- View Mode -->
            <p
              v-else
              class="text-sm text-gray-800"
              :class="{
                'line-through text-gray-400': todo.status === 'completed',
              }"
            >
              {{ todo.task }}
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-0">
          <p class="mt-1 text-xs text-gray-400">
            Created at {{ formatDate(todo.created_at) }}
          </p>
          <p class="mt-1 text-xs text-gray-400">
            Updated at {{ formatDate(todo.updated_at) }}
          </p>
        </div>
      </div>

      <div
        class="flex items-center space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0"
      >
        <button
          v-if="editingId !== todo.id"
          @click="$emit('start-edit', todo)"
          class="flex-1 sm:flex-none px-2 py-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          title="Edit task"
        >
          <i class="pi pi-pencil" />
        </button>
        <button
          v-if="editingId !== todo.id"
          @click="$emit('update-status', todo)"
          class="flex-1 sm:flex-none px-2 py-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          :title="'Mark as ' + statusTransitions[todo.status]"
        >
          <i :class="['pi', getStatusIcon(todo.status)]" />
        </button>
        <button
          v-if="editingId !== todo.id"
          @click="$emit('delete-todo', todo.id!)"
          class="flex-1 sm:flex-none px-2 py-1 rounded-full hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600"
          title="Delete task"
        >
          <i class="pi pi-trash" />
        </button>
      </div>
    </div>
  </div>
</template>
