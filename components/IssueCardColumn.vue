<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

import { type IssueStatus, mockIssues } from '../fixtures/issues'
defineProps<{ title: IssueStatus }>()
</script>

<template>
  <div
    class="flex min-w-[350px] max-w-[350px] flex-1 flex-col rounded border border-rad-border-hint bg-rad-background-dip"
  >
    <h3 class="p-2 text-xl font-semibold capitalize">{{ title }}</h3>

    <VueDraggable
      v-model="mockIssues[title]"
      tag="ul"
      class="flex flex-1 flex-col gap-2 p-2"
      ghost-class="opacity-50"
      :animation="150"
      group="issues"
    >
      <slot></slot>
    </VueDraggable>
  </div>
</template>
