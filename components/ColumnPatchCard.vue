<script setup lang="ts">
import ColumnCard from './ColumnCard.vue'
import type { Patch } from '~/types/tasks'

const props = defineProps<{
  patch: Patch
}>()

type ColumnCardStatus = InstanceType<typeof ColumnCard>['$props']['status']

const route = useRoute()

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

const dataLabels = computed(() =>
  props.patch.labels.filter((label) => label.startsWith(dataLabelNamespace)),
)

const radicleInterfaceBaseUrl = useRadicleInterfaceBaseUrl()
const href = computed(() =>
  new URL(
    `/nodes/${route.params.node}/${route.params.rid}/patches/${props.patch.id}`,
    radicleInterfaceBaseUrl,
  ).toString(),
)
</script>


<template>
  <ColumnCard
    :id="patch.id"
    :title="patch.title"
    :labels="dataLabels"
    :href="href"
    :status="status"
  />
</template>