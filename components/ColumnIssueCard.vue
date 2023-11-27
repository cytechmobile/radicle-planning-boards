<script setup lang="ts">
defineProps<{ id: string; title: string }>()
</script>

<template>
  <article
    class="flex flex-col gap-1 rounded bg-rad-background-float p-3 transition-opacity hover:bg-rad-fill-float-hover"
  >
    <small>
      <pre class="text-xs font-medium text-rad-foreground-dim">{{ id.slice(0, 7) }}</pre>
    </small>

    <h4>
      <NuxtLink href="#" class="w-fit text-sm hover:underline">{{ title }}</NuxtLink>
    </h4>
  </article>
</template>
