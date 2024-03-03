import type { Task } from '~/types/tasks'

export function useTasksFetch() {
  const { $httpdFetch } = useNuxtApp()
  const route = useRoute()

  async function updateTaskLabels(task: Task, labels: string[]) {
    switch (task.rpb.kind) {
      case 'issue':
        return await $httpdFetch(`/projects/{rid}/issues/{issue}`, {
          path: { rid: route.params.rid, issue: task.id },
          method: 'PATCH',
          body: {
            type: 'label',
            labels,
          },
        })
      case 'patch':
        return await $httpdFetch(`/projects/{rid}/patches/{patch}`, {
          path: { rid: route.params.rid, patch: task.id },
          method: 'PATCH',
          body: {
            type: 'label',
            labels,
          },
        })
      default:
        throw new Error('Unsupported task kind')
    }
  }

  return {
    updateTaskLabels,
  }
}
