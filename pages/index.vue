<script setup lang="ts">
import { type IssueStatus, mockIssues } from '../fixtures/issues'

const statuses = Object.keys(mockIssues) as IssueStatus[]
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto px-2 py-6">
    <IssueCardColumn v-for="status in statuses" :key="status" :title="status">
      <li v-for="issue in mockIssues[status]" :key="issue.id">
        <IssueCard v-bind="issue" />
      </li>
    </IssueCardColumn>
  </div>
</template>
