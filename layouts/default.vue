<script setup lang="ts">
useTheme()
const tasksStore = useTasksStore()

const isLoading = computed(() => !tasksStore.columnMap)
</script>

<template>
  <div class="flex h-dvh flex-col" aria-live="polite" :aria-busy="isLoading">
    <Loading v-if="isLoading" />
    <template v-else>
      <Header />

      <main class="flex flex-1 flex-col overflow-y-hidden">
        <slot></slot>
      </main>
    </template>
  </div>
</template>

