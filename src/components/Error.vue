<script setup lang="ts">
import { defineComponent } from 'vue'

const props = defineProps({
  error: String,
})

defineComponent({
  name: 'ErrorComponent',
})
</script>

<template>
  <div
    v-if="props.error"
    class="text-sm flex justify-between w-full p-3 border border-red-600 mt-2 bg-red-200 text-red-600"
  >
    <p class="w-[90%] text-red-600">{{ props.error }}</p>
    <p
      class="cursor-pointer underline text-red-600 font-semibold"
      @click="$emit('close')"
    >
      Close
    </p>
  </div>
</template>
