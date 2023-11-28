<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { Issue, IssueStatus } from '../constants/issues'

const props = defineProps<{ title: IssueStatus; issues: Issue[] }>()
const issuesModel = ref(unref(toRefs(props).issues)) // create new ref with the same contents

const TITLE_TO_ICON_MAP = {
  todo: 'heroicons:clipboard-document-list',
  doing: 'heroicons:cog-6-tooth',
  done: 'heroicons:check-badge',
} satisfies Record<IssueStatus, string>
</script>

<template>
  <div
    class="flex min-w-[350px] max-w-[350px] flex-1 flex-col rounded border border-rad-border-hint bg-rad-background-dip"
  >
    <div class="flex items-center justify-between p-2">
      <div class="flex items-center gap-2">
        <Icon :name="TITLE_TO_ICON_MAP[title]" size="24" />
        <h3 class="text-xl font-semibold capitalize">{{ title }}</h3>
      </div>

      <small
        class="rounded bg-rad-fill-ghost px-3 py-0.5 text-sm font-semibold text-rad-foreground-gray"
      >
        {{ issuesModel.length }} {{ issuesModel.length === 1 ? 'issue' : 'issues' }}
      </small>
    </div>

    <VueDraggable
      v-model="issuesModel"
      tag="ul"
      class="flex flex-1 flex-col gap-2 p-2"
      ghost-class="opacity-50"
      :animation="150"
      group="issues"
    >
      <li v-for="issue in issuesModel" :key="issue.id">
        <ColumnIssueCard v-bind="issue" />
      </li>
    </VueDraggable>
  </div>
</template>
