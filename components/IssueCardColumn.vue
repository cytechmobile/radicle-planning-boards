<script lang="ts" setup>
defineProps<{ title: string }>()
</script>

<template>
  <div
    class="min-w-[350px] max-w-[350px] flex-1 rounded border border-rad-border-hint bg-rad-background-dip"
  >
    <h3 class="p-2 text-xl font-semibold capitalize">{{ title }}</h3>

    <ul class="flex flex-col gap-2 p-2">
      <slot></slot>
    </ul>
  </div>
</template>
