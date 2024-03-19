<script setup lang="ts">
useTheme()
</script>

<template>
  <div class="flex h-[100dvh] flex-col gap-4 pt-4">
    <Header />

    <main class="flex flex-1 flex-col overflow-y-hidden">
      <slot></slot>
    </main>
  </div>
</template>

