<script setup lang="ts">
import ToDoInput from './components/ToDoInput.vue'
import ListTodos from './components/ListTodos.vue'
</script>

<template>
  <div class="md:w-[50vw] mx-4 h-[100vh] py-4 md:mx-auto">
    <div
      class="text-3xl text-center w-full p-3 border border-black font-bold rounded-md"
    >
      Welcome to ToDoist
    </div>
    <ToDoInput />
    <ListTodos />
  </div>
</template>
