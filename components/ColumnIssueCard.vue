<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const props = defineProps<{ id: string; title: string; labels: string[] }>()
const route = useRoute()

const dataLabels = computed(() =>
  props.labels.filter((label) => label.startsWith(dataLabelNamespace)),
)

const radicleInterfaceBaseUrl = useRadicleInterfaceBaseUrl()
const showConfigDataLabels = useStorage('RPB_config-show-data-labels', false)

const href = computed(() =>
  new URL(
    `/nodes/${route.params.node}/${route.params.rid}/issues/${props.id}`,
    radicleInterfaceBaseUrl,
  ).toString(),
)
</script>

<template>
  <article
    class="flex flex-col gap-1 rounded bg-rad-background-float p-3 transition-opacity hover:cursor-grab hover:bg-rad-fill-float-hover"
  >
    <small>
      <pre class="text-xs font-medium text-rad-foreground-dim">{{ id.slice(0, 7) }}</pre>
    </small>

    <h4>
      <a :href="href" target="_blank" class="w-fit text-sm hover:underline">
        {{ title }}
      </a>
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
