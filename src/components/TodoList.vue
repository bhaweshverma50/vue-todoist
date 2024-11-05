<script setup lang="ts">
import { onMounted, computed, ref, defineComponent } from 'vue'
import { useTodoStore } from '@/store'
import type { ToDos } from '@/types'
import { useAlert } from '@/utils/useAlerts'
import TodoCard from './TodoCard.vue'

const store = useTodoStore()
const searchText = ref('')
const selectedStatus = ref<ToDos['status'] | 'all'>('all')
const sortBy = ref<'created' | 'updated'>('created')
const sortOrder = ref<'asc' | 'desc'>('desc')
const { showAlert } = useAlert()

const editingId = ref<string | null>(null)
const editingText = ref('')

defineComponent({
  name: 'TodoList',
})

onMounted(() => {
  store.fetchTodos()
})

const filteredAndSortedTodos = computed(() => {
  let filtered = store.getTodos

  // Filter by search text
  if (searchText.value) {
    filtered = filtered.filter(todo =>
      todo.task.toLowerCase().includes(searchText.value.toLowerCase()),
    )
  }

  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(todo => todo.status === selectedStatus.value)
  }

  // Sort todos
  return [...filtered].sort((a, b) => {
    const dateA = new Date(
      sortBy.value === 'created' ? a.created_at : a.updated_at,
    )
    const dateB = new Date(
      sortBy.value === 'created' ? b.created_at : b.updated_at,
    )
    return sortOrder.value === 'desc'
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime()
  })
})

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const toggleSortBy = () => {
  sortBy.value = sortBy.value === 'created' ? 'updated' : 'created'
}

const startEditing = (todo: ToDos) => {
  editingId.value = todo.id!
  editingText.value = todo.task
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
    updated_at: new Date(),
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

const refreshTodos = () => {
  store.fetchTodos()
}

const updateStatus = async (todo: ToDos) => {
  const statusTransitions = {
    pending: 'in-progress',
    'in-progress': 'completed',
    completed: 'pending',
  } as const

  const updatedTodo = {
    ...todo,
    status: statusTransitions[todo.status],
    updated_at: new Date(),
  }
  await store.updateTodo(updatedTodo)
}
</script>

<template>
  <div
    class="w-full min-h-[77vh] bg-white rounded-lg shadow-sm border border-black mt-3"
  >
    <!-- Header Section -->
    <div class="p-3 sm:p-4 border-b border-gray-100">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Your Tasks</h2>
        <button
          @click="refreshTodos"
          class="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-gray-100 transition-colors"
          :class="{ 'animate-spin': store.isLoading }"
        >
          <i class="pi pi-refresh" />
        </button>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div class="flex-1">
          <div class="flex items-center border border-gray-300 rounded px-2">
            <i class="pi pi-search text-gray-400 mr-2" />
            <input
              v-model="searchText"
              type="text"
              class="w-full h-8 text-sm focus:outline-none focus:ring-0"
              placeholder="Search tasks"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <select
            v-model="selectedStatus"
            class="h-8 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-0"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <button
            @click="toggleSortBy"
            class="h-8 px-3 border border-gray-300 rounded text-sm hover:bg-gray-50 whitespace-nowrap"
          >
            {{ sortBy === 'created' ? 'Created' : 'Updated' }}
          </button>

          <button
            @click="toggleSortOrder"
            class="h-8 w-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
          >
            <i
              :class="[
                'pi',
                sortOrder === 'desc'
                  ? 'pi-sort-amount-down'
                  : 'pi-sort-amount-up',
              ]"
            />
          </button>
        </div>
      </div>
    </div>

    <div class="p-3 sm:p-4">
      <div
        v-if="store.isLoading"
        class="flex flex-col items-center justify-center py-12 space-y-4 text-gray-400"
      >
        <i class="pi pi-spinner animate-spin text-3xl" />
        <p class="text-sm">Loading your tasks...</p>
      </div>

      <div
        v-else-if="!filteredAndSortedTodos.length"
        class="flex flex-col items-center justify-center py-12 space-y-4 text-gray-400"
      >
        <i class="pi pi-inbox text-3xl" />
        <p class="text-sm text-center px-4">
          {{
            searchText || selectedStatus !== 'all'
              ? 'No tasks match your filters'
              : 'No tasks yet. Add one to get started!'
          }}
        </p>
      </div>

      <div
        v-else
        class="space-y-3 max-h-[calc(77vh-14rem)] sm:max-h-[calc(77vh-12rem)] overflow-y-auto"
      >
        <TodoCard
          v-for="todo in filteredAndSortedTodos"
          :key="todo.id"
          :todo="todo"
          :editing-id="editingId"
          v-model="editingText"
          @start-edit="startEditing"
          @save-edit="saveEdit"
          @cancel-edit="cancelEditing"
          @update-status="updateStatus"
          @delete-todo="store.deleteTodo"
        />
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
