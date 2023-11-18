<script lang="ts" setup>
// eslint-disable-next-line prettier/prettier
const { title } = defineProps<{ id: string, title: string }>()
</script>

<template>
  <li
    class="bg-rad-background-float border-rad-border-hint border rounded-[4px] pt-2 px-2 pb-6 hover:bg-rad-fill-float-hover flex flex-col gap-1"
  >
    <span class="text-xs text-rad-foreground-emphasized font-medium">
      {{ id.slice(0, 7) }}
    </span>
    <a href="#" class="hover:underline w-fit text-sm">{{ title }}</a>
  </li>
</template>
