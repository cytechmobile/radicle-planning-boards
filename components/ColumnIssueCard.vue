<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { Issue } from '~/types/httpd'

interface Props {
  id: Issue['id']
  title: Issue['title']
  labels: Issue['labels']
  state: Issue['state']
}

const props = defineProps<Props>()
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

const statusToIconMap = {
  open: { name: 'octicon:issue-opened-16', class: 'text-rad-foreground-success' },
  closed: { name: 'octicon:issue-closed-16', class: 'text-rad-foreground-red' },
} satisfies Record<Props['state']['status'], { name: string; class: string }>
</script>

<template>
  <article
    class="flex flex-col gap-1 rounded bg-rad-background-float p-3 transition-opacity hover:bg-rad-fill-float-hover"
  >
    <small class="flex items-center gap-2">
      <span class="sr-only">{{ state.status }}</span>
      <UTooltip :text="state.status" :popper="{ placement: 'top' }">
        <Icon
          :name="statusToIconMap[state.status].name"
          size="16"
          :class="statusToIconMap[state.status].class"
        />
      </UTooltip>
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
