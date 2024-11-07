<script setup lang="ts">
import ToDoInput from './components/ToDoInput.vue'
import TodoList from './components/TodoList.vue'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="md:w-[50vw] mx-4 h-[100vh] py-4 md:mx-auto">
    <NavBar />
    <ToDoInput />
    <TodoList />
  </div>
</template>
