<script setup lang="ts">
defineProps<{
  label: string
  icon: string
  padded?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="w-fit cursor-pointer rounded leading-none text-rad-foreground-dim hover:bg-rad-fill-ghost disabled:cursor-none disabled:bg-transparent disabled:text-rad-foreground-disabled"
    :class="{ 'p-1': padded ?? true }"
  >
    <span class="sr-only">{{ label }}</span>
    <Icon :name="icon" size="20" />
  </button>
</template>