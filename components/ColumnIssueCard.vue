<script setup lang="ts">
import ColumnCard from './ColumnCard.vue'
import type { Issue } from '~/types/tasks'

const props = defineProps<{
  issue: Issue
  query?: RegExp
}>()

type ColumnCardStatus = InstanceType<typeof ColumnCard>['$props']['status']

const route = useRoute('node-rid')

const statusIconMap = {
  open: { name: 'octicon:issue-opened-16', class: 'text-rad-foreground-success' },
  closed: { name: 'octicon:issue-closed-16', class: 'text-rad-foreground-red' },
} satisfies Record<Issue['state']['status'], ColumnCardStatus['icon']>

const status = computed<ColumnCardStatus>(() => ({
  name: props.issue.state.status,
  icon: statusIconMap[props.issue.state.status],
}))

const radicleInterfaceBaseUrl = useRadicleInterfaceBaseUrl()
const isDebugging = useIsDebugging()

const labels = computed(() =>
  isDebugging.value
    ? props.issue.labels
    : props.issue.labels.filter((label) => !label.startsWith(dataLabelNamespace)),
)

const href = computed(() =>
  new URL(
    `/nodes/${route.params.node}/${route.params.rid}/issues/${props.issue.id}`,
    radicleInterfaceBaseUrl,
  ).toString(),
)
</script>


<template>
  <ColumnCard
    :id="issue.id"
    :title="issue.title"
    :labels="labels"
    :href="href"
    :status="status"
    :query="query"
  />
</template>