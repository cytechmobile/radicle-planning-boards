<script setup lang="ts">
useTheme()
const tasksStore = useTasksStore()
</script>

<template>
  <div
    class="flex h-dvh flex-col gap-4 pt-4"
    aria-live="polite"
    :aria-busy="!tasksStore.isReady"
  >
    <Loading v-if="!tasksStore.isReady" />
    <template v-else>
      <Header />

      <main class="flex flex-1 flex-col overflow-y-hidden">
        <slot></slot>
      </main>
    </template>
  </div>
</template>

