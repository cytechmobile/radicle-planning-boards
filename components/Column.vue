<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { Issue, IssueStatus } from '../constants/issues'

const props = defineProps<{ title: IssueStatus; issues: Issue[] }>()
const issuesModel = ref(unref(toRefs(props).issues)) // create new ref with the same contents
</script>

<template>
  <div
    class="flex min-w-[350px] max-w-[350px] flex-1 flex-col rounded border border-rad-border-hint bg-rad-background-dip"
  >
    <h3 class="p-2 text-xl font-semibold capitalize">{{ title }}</h3>

    <VueDraggable
      v-model="issuesModel"
      tag="ul"
      class="flex flex-1 flex-col gap-2 p-2"
      ghost-class="opacity-50"
      :animation="150"
      group="issues"
    >
      <ColumnIssueCard
        v-for="issue in issuesModel"
        :id="issue.id"
        :key="issue.id"
        :title="issue.title"
      />
    </VueDraggable>
  </div>
</template>