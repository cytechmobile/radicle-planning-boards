<script setup lang="ts">
import ColumnCard from './ColumnCard.vue'
import type { Patch, TaskHighlights } from '~/types/tasks'

const props = defineProps<{
  patch: Patch
  highlights?: TaskHighlights
}>()

type ColumnCardStatus = InstanceType<typeof ColumnCard>['$props']['status']

const route = useRoute('node-rid')

const statusIconMap = {
  draft: { name: 'octicon:git-pull-request-draft-16', class: 'text-rad-fill-gray' },
  open: { name: 'octicon:git-pull-request-16', class: 'text-rad-foreground-success' },
  archived: {
    name: 'octicon:git-pull-request-closed-16',
    class: 'text-rad-foreground-yellow',
  },
  merged: { name: 'octicon:git-merge-16', class: 'text-rad-foreground-primary' },
} satisfies Record<Patch['state']['status'], ColumnCardStatus['icon']>

const status = computed<ColumnCardStatus>(() => ({
  name: props.patch.state.status,
  icon: statusIconMap[props.patch.state.status],
}))

const hostAppBaseUrl = useHostAppBaseUrl()
const isDebugging = useIsDebugging()

// TODO: zac reduce duplication between ColumnIssueCard and ColumnPatchCard
const labels = computed(() =>
  isDebugging.value
    ? props.patch.labels
    : props.patch.labels.filter((label) => !label.startsWith(dataLabelNamespace)),
)

const highlights = computed(() => {
  if (!props.highlights) {
    return undefined
  }

  if (isDebugging.value) {
    return props.highlights
  }

  const filteredHighlightLabels = props.highlights.labels.filter(
    (label) => !(label[0] ?? '').startsWith(dataLabelNamespace),
  )

  return {
    ...props.highlights,
    labels: filteredHighlightLabels,
  }
})

const href = computed(() =>
  new URL(
    `/nodes/${route.params.node}/${route.params.rid}/patches/${props.patch.id}`,
    hostAppBaseUrl,
  ).toString(),
)
</script>


<template>
  <ColumnCard
    :id="patch.id"
    :title="patch.title"
    :labels="labels"
    :href="href"
    :status="status"
    :highlights="highlights"
  />
</template>