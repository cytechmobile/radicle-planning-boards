<script setup lang="ts">
import type { Issue } from '~/types/httpd'
import { columnTitles } from '~/constants/columns'

const route = useRoute()
const { data: issuesByColumn } = useHttpdFetch('/projects/{rid}/issues', {
  path: {
    rid: route.params.rid,
  },
  transform: (data) => groupIssuesByColumn(data as Issue[]),
})

const isInIFrame = globalThis.window !== globalThis.window.parent
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto" :class="{ 'px-2 py-6': !isInIFrame }">
    <Column
      v-for="columnTitle in columnTitles"
      :key="columnTitle"
      :title="columnTitle"
      :issues="issuesByColumn ? issuesByColumn[columnTitle] : []"
    />
  </div>
</template>
