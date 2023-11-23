<script lang="ts" setup>
defineProps<{ id: string; title: string }>()
</script>

<template>
  <li
    class="flex flex-col gap-1 rounded-[4px] bg-rad-background-float px-2 pb-6 pt-2 hover:bg-rad-fill-float-hover"
  >
    <span class="text-xs font-medium text-rad-foreground-dim">
      {{ id.slice(0, 7) }}
    </span>

    <a href="#" class="w-fit text-sm hover:underline">{{ title }}</a>
  </li>
</template>
