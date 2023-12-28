<script setup lang="ts">
defineProps<{
  label: string
  icon: string
}>()
</script>

<template>
  <button
    type="button"
    class="w-fit rounded p-1 leading-none text-rad-foreground-dim hover:bg-rad-fill-ghost disabled:bg-transparent disabled:text-rad-foreground-disabled"
  >
    <span class="sr-only">{{ label }}</span>
    <Icon :name="icon" size="20" />
  </button>
</template>