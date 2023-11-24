<script setup lang="ts">
// Mock data, to be replaced with real data from the API
const statuses = ['todo', 'doing', 'done'] as const

const issues = ref({
  todo: [
    {
      id: '42ddc58de82757cf729f6c1b4fba0536',
      title: 'Implement User Authentication',
    },
    {
      id: '703abf5af2fc9c4a3e7dbb1193e83511',
      title: 'Design Database Schema',
    },
    {
      id: 'a0a85d0c34f73ec3b8c213409b2e8d29',
      title: 'An issue with a really long name to see whether the ui handles it well or not',
    },
  ],
  doing: [
    {
      id: '26ec420ba69483f7298f3842b8e759f4',
      title: 'Create API Endpoints',
    },
    {
      id: '41922e1ed28e9eaf7b6124af8f42bdfa',
      title: 'Fix Login Bug',
    },
  ],
  done: [
    {
      id: 'dfbbf053f6ecbecd66f966574f6bd6ed',
      title: 'Improve Page Load Performance',
    },
    {
      id: '81a2a5b64efdec72e59c5de36b7dc997',
      title: 'Add Unit Tests',
    },
  ],
})
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto px-2 py-6">
    <IssueCardColumn
      v-for="status in statuses"
      :key="status"
      v-model="issues[status]"
      :title="status"
      group="issues"
    >
      <li v-for="issue in issues[status]" :key="issue.id">
        <IssueCard v-bind="issue" />
      </li>
    </IssueCardColumn>
  </div>
</template>
