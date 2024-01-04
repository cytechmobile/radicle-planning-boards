<script setup lang="ts">
defineProps<{
  label: string
  icon: string
}>()
</script>

<template>
  <button
    type="button"
    class="w-fit rounded p-1 leading-none text-rad-foreground-dim hover:bg-rad-fill-ghost"
  >
    <span class="sr-only">{{ label }}</span>
    <Icon :name="icon" size="20" />
  </button>
</template>