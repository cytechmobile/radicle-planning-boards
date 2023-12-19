<script setup lang="ts">
import type { Issue } from '~/types/httpd'
import { columns } from '~/constants/columns'
const { $httpdFetch } = useNuxtApp()

const route = useRoute()

const { data: issuesByColumn } = useAsyncData(
  'all-issues',
  async () => {
    function createFetchIssuesOptions(state: 'open' | 'closed') {
      return {
        path: {
          rid: route.params.rid,
        },
        query: { perPage: 1000, state },
      }
    }

    const [openIssues, closedIssues] = await Promise.all([
      $httpdFetch('/projects/{rid}/issues', createFetchIssuesOptions('open')),
      $httpdFetch('/projects/{rid}/issues', createFetchIssuesOptions('closed')),
    ])

    return [...openIssues, ...closedIssues]
  },
  {
    transform: (data) => groupIssuesByColumn(data as Issue[]),
  },
)

const isInIFrame = globalThis.window !== globalThis.window.parent
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto" :class="{ 'px-2 py-6': !isInIFrame }">
    <Column
      v-for="column in columns"
      :key="column"
      :title="column"
      :issues="issuesByColumn ? issuesByColumn[column] : []"
    />
  </div>
</template>
