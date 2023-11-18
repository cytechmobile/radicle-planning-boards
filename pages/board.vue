<script lang="ts" setup>
// Mock data, to be replaced with real data from the API
const statuses = ['todo', 'doing', 'done']

const issues = [
  {
    id: '42ddc58de82757cf729f6c1b4fba0536',
    title: 'Implement User Authentication',
    status: 'todo',
  },
  {
    id: '703abf5af2fc9c4a3e7dbb1193e83511',
    title: 'Design Database Schema',
    status: 'todo',
  },
  {
    id: 'a0a85d0c34f73ec3b8c213409b2e8d29',
    title: 'An issue with a really long name to see whether the ui handles it well or not',
    status: 'todo',
  },
  {
    id: '26ec420ba69483f7298f3842b8e759f4',
    title: 'Create API Endpoints',
    status: 'doing',
  },
  {
    id: '41922e1ed28e9eaf7b6124af8f42bdfa',
    title: 'Fix Login Bug',
    status: 'doing',
  },
  {
    id: 'dfbbf053f6ecbecd66f966574f6bd6ed',
    title: 'Improve Page Load Performance',
    status: 'done',
  },
  {
    id: '81a2a5b64efdec72e59c5de36b7dc997',
    title: 'Add Unit Tests',
    status: 'done',
  },
]
</script>

<template>
  <main class="min-h-screen flex flex-col">
    <div class="flex-1 flex gap-2 px-2 py-6 overflow-x-auto">
      <Column v-for="status in statuses" :key="status" :title="status">
        <IssueCard
          v-for="issue in issues.filter((issue) => issue.status === status)"
          :id="issue.id"
          :key="issue.id"
          :title="issue.title"
        />
      </Column>
    </div>
  </main>
</template>
