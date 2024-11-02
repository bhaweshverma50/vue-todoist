<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTodoStore } from '@/store'
import ErrorAlert from '@/components/ErrorAlert.vue'
import { useAlert } from '@/utils/useAlerts'

const store = useTodoStore()
const todoInput = ref('')
const { alert, showAlert, clearAlert } = useAlert()

const clearInput = () => {
  todoInput.value = ''
}

const addTodo = async () => {
  if (!todoInput.value.trim()) {
    showAlert({
      message: 'Please enter a task',
      type: 'warning',
      autoClose: true,
    })
    return
  }

  const success = await store.addTodo(todoInput.value)
  if (success) {
    clearInput()
    showAlert({
      message: 'Todo added successfully!',
      type: 'success',
      autoClose: true,
      duration: 3000,
    })
  }
}

watch(
  () => store.getError,
  error => {
    if (error) {
      showAlert({
        message: error,
        type: 'error',
        autoClose: true,
        duration: 5000,
      })
    }
  },
)
</script>

<template>
  <form @submit.prevent="addTodo">
    <div
      class="w-full flex p-3 rounded-md border border-black mt-2 items-center justify-between gap-2 h-full"
    >
      <input
        v-model="todoInput"
        type="text"
        class="w-full h-full p-2 border border-black"
        placeholder="Enter a task to add"
      />
      <button
        type="button"
        class="w-[20%] h-full px-2 py-[5px] border border-black hover:bg-black hover:text-white"
        @click="clearInput"
      >
        Clear
      </button>
      <button
        type="submit"
        class="w-[20%] h-full px-2 py-[5px] border border-black hover:bg-black hover:text-white"
      >
        Add
      </button>
    </div>
  </form>
  <ErrorAlert v-if="alert" v-bind="alert" @close="clearAlert" />
</template>
