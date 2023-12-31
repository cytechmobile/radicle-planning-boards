<script setup lang="ts">
useTheme()

const auth = useAuthStore()
</script>

<template>
  <div class="flex h-[100dvh] flex-col gap-4">
    <Header v-if="auth.isAuthenticated" />

    <main class="flex flex-1 flex-col">
      <slot></slot>
    </main>
  </div>
</template>

