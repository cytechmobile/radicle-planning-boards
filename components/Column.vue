<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { Issue, IssueStatus } from '../types/issues'

interface VueDraggableAddEvent {
  item: HTMLElement
}

const props = defineProps<{ title: IssueStatus; issues: Issue[] }>()
const emit = defineEmits<(e: 'add', id: string) => void>()

const issuesModel = ref<Issue[]>([])

watchEffect(() => {
  issuesModel.value = [...unref(toRef(props, 'issues'))] // "clone" issues prop
})

const STATUS_TO_ICON_MAP = {
  todo: { name: 'bx:circle', class: 'text-rad-foreground-contrast' },
  doing: { name: 'bx:adjust', class: 'text-rad-foreground-yellow' },
  done: { name: 'bx:bxs-circle', class: 'text-rad-foreground-success' },
} satisfies Record<IssueStatus, { name: string; class: string }>

function handleAdd(event: VueDraggableAddEvent) {
  const id = event.item.dataset['id']
  if (!id) {
    return
  }

  emit('add', id)
}
</script>

<template>
  <div
    class="flex min-w-[350px] max-w-[350px] flex-1 flex-col rounded border border-rad-border-hint bg-rad-background-dip"
  >
    <div class="flex items-baseline gap-2 p-2">
      <Icon
        :name="STATUS_TO_ICON_MAP[title].name"
        size="20"
        :class="`translate-y-1 ${STATUS_TO_ICON_MAP[title].class}`"
      />
      <h3 class="font-semibold capitalize">{{ title }}</h3>

      <small class="text-sm font-semibold text-rad-foreground-gray">
        {{ issuesModel.length }}
      </small>
    </div>

    <VueDraggable
      v-model="issuesModel"
      tag="ul"
      class="flex flex-1 flex-col gap-2 p-2"
      ghost-class="opacity-50"
      :animation="150"
      group="issues"
      @add="handleAdd"
    >
      <li v-for="issue in issuesModel" :key="issue.id" :data-id="issue.id">
        <ColumnIssueCard v-bind="issue" />
      </li>
    </VueDraggable>
  </div>
</template>
