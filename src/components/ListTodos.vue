<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useTodoStore } from '@/store'
import type { ToDos } from '@/types'
import { useAlert } from '@/utils/useAlerts'

const store = useTodoStore()
const { showAlert } = useAlert()

const editingId = ref<string | null>(null)
const editingText = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

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

onMounted(() => {
  store.fetchTodos()
})

const sortedTodos = computed(() => {
  return [...store.getTodos].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (a.status !== 'completed' && b.status === 'completed') return -1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

const startEditing = (todo: ToDos) => {
  editingId.value = todo.id!
  editingText.value = todo.task

  if (editInputRef.value) {
    editInputRef.value.focus()
  }
}

const cancelEditing = () => {
  editingId.value = null
  editingText.value = ''
}

const saveEdit = async (todo: ToDos) => {
  const trimmedText = editingText.value.trim()
  if (!trimmedText) {
    showAlert({
      message: 'Task cannot be empty',
      type: 'warning',
      autoClose: true,
    })
    return
  }

  if (trimmedText === todo.task) {
    cancelEditing()
    return
  }

  const updatedTodo = {
    ...todo,
    task: trimmedText,
    updated_at: new Date().toISOString(),
  }

  const success = await store.updateTodo(updatedTodo)
  if (success) {
    showAlert({
      message: 'Task updated successfully!',
      type: 'success',
      autoClose: true,
      duration: 3000,
    })
    cancelEditing()
  }
}

const handleKeyDown = (e: KeyboardEvent, todo: ToDos) => {
  if (e.key === 'Escape') {
    cancelEditing()
  } else if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    saveEdit(todo)
  }
}

const refreshTodos = () => {
  store.fetchTodos()
}

const deleteTodo = async (id: string) => {
  await store.deleteTodo(id)
}

const updateStatus = async (todo: ToDos) => {
  const updatedTodo = {
    ...todo,
    status: statusTransitions[todo.status],
    updated_at: new Date().toISOString(),
  }
  await store.updateTodo(updatedTodo)
}

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
</script>

<template>
  <div
    class="w-full h-[77vh] bg-white rounded-lg shadow-sm border border-black mt-3"
  >
    <div class="p-4 border-b border-gray-100 flex justify-between items-center">
      <h2 class="text-lg font-semibold text-gray-800">Your Tasks</h2>
      <button
        @click="refreshTodos"
        class="p-2 rounded-full hover:bg-gray-100 transition-colors"
        :class="{ 'animate-spin': store.isLoading }"
      >
        <i class="pi pi-refresh" />
      </button>
    </div>

    <div class="p-4">
      <div
        v-if="store.isLoading"
        class="flex flex-col items-center justify-center py-12 space-y-4 text-gray-400"
      >
        <i class="pi pi-spinner animate-spin text-3xl" />
        <p class="text-sm">Loading your tasks...</p>
      </div>
      <div
        v-else-if="!sortedTodos.length"
        class="flex flex-col items-center justify-center py-12 space-y-4 text-gray-400"
      >
        <i class="pi pi-inbox text-3xl" />
        <p class="text-sm">No tasks yet. Add one to get started!</p>
      </div>

      <div v-else class="space-y-3 max-h-[calc(77vh-8rem)] overflow-y-auto">
        <div
          v-for="todo in sortedTodos"
          :key="todo.id"
          class="group p-4 border border-gray-200 rounded-lg hover:border-gray-200 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
        >
          <div class="flex items-center justify-between gap-2">
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
                    <div class="flex items-center space-x-2">
                      <input
                        ref="editInputRef"
                        v-model="editingText"
                        type="text"
                        class="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                        @keydown="e => handleKeyDown(e, todo)"
                      />
                      <button
                        class="p-1 text-green-600 hover:text-green-700 focus:outline-none"
                        @click="saveEdit(todo)"
                        title="Save changes"
                      >
                        <i class="pi pi-check" />
                      </button>
                      <button
                        class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                        @click="cancelEditing"
                        title="Cancel editing"
                      >
                        <i class="pi pi-times" />
                      </button>
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
              class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                v-if="editingId !== todo.id"
                @click="() => startEditing(todo)"
                class="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                title="Edit task"
              >
                <i class="pi pi-pencil" />
              </button>
              <button
                v-if="editingId !== todo.id"
                @click="() => updateStatus(todo)"
                class="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                :title="'Mark as ' + statusTransitions[todo.status]"
              >
                <i :class="['pi', getStatusIcon(todo.status)]" />
              </button>
              <button
                v-if="editingId !== todo.id"
                @click="() => deleteTodo(todo.id!)"
                class="p-2 rounded-full hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600"
                title="Delete task"
              >
                <i class="pi pi-trash" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>
