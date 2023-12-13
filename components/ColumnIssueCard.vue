<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const props = defineProps<{ id: string; title: string; labels: string[] }>()

const dataLabels = computed(() =>
  props.labels.filter((label) => label.startsWith(DATA_LABEL_PREFIX)),
)

const showConfigDataLabels = useStorage('RPB_config-show-data-labels', false)
</script>

<template>
  <article
    class="flex flex-col gap-1 rounded bg-rad-background-float p-3 transition-opacity hover:cursor-grab hover:bg-rad-fill-float-hover"
  >
    <small>
      <pre class="text-xs font-medium text-rad-foreground-dim">{{ id.slice(0, 7) }}</pre>
    </small>

    <h4>
      <NuxtLink href="#" class="w-fit text-sm hover:underline">{{ title }}</NuxtLink>
    </h4>

    <ul v-if="showConfigDataLabels">
      <li
        v-for="label in dataLabels"
        :key="label"
        class="mt-2 text-xs font-bold text-rad-foreground-emphasized"
      >
        {{ label }}
      </li>
    </ul>
  </article>
</template>
