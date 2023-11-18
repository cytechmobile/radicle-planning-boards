<script lang="ts" setup>
const { title } = defineProps<{ title: string }>()
</script>

<template>
  <div class="border-rad-border-hint border flex-1 max-w-[350px] min-w-[350px] rounded-[4px]">
    <h3 class="p-2 font-medium text-lg capitalize">{{ title }}</h3>

    <ul class="p-2 flex flex-col gap-2">
      <slot />
    </ul>
  </div>
</template>
