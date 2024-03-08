import type { RadicleIssue, RadiclePatch } from '~/types/httpd'
import type { Task } from '~/types/tasks'

export function useTasksFetch() {
  const { $httpdFetch } = useNuxtApp()
  const route = useRoute()

  async function fetchIssue(id: string) {
    const issue = await $httpdFetch('/projects/{rid}/issues/{issue}', {
      path: { rid: route.params.rid, issue: id },
    })

    return issue as RadicleIssue
  }

  async function fetchIssues() {
    const issueStatuses = ['open', 'closed'] satisfies RadicleIssue['state']['status'][]

    const radicleIssuesByStatus = await Promise.all(
      issueStatuses.map(
        async (status) =>
          await $httpdFetch('/projects/{rid}/issues', {
            path: {
              rid: route.params.rid,
            },
            // @ts-expect-error - wrong type definition
            query: { perPage: 1000, state: status },
          }),
      ),
    )

    const radicleIssues = radicleIssuesByStatus.flat()

    return radicleIssues as RadicleIssue[]
  }

  async function fetchPatch(id: string) {
    const patch = await $httpdFetch('/projects/{rid}/patches/{patch}', {
      path: { rid: route.params.rid, patch: id },
    })

    return patch as RadiclePatch
  }

  async function fetchPatches() {
    const patchStatuses = [
      'draft',
      'open',
      'archived',
      'merged',
    ] satisfies RadiclePatch['state']['status'][]

    const radiclePatchesByStatus = await Promise.all(
      patchStatuses.map(
        async (status) =>
          await $httpdFetch('/projects/{rid}/patches', {
            path: {
              rid: route.params.rid,
            },
            // @ts-expect-error - wrong type definition
            query: { perPage: 1000, state: status },
          }),
      ),
    )

    const radiclePatches = radiclePatchesByStatus.flat()

    return radiclePatches as RadiclePatch[]
  }

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
    fetchIssue,
    fetchIssues,
    fetchPatch,
    fetchPatches,
    updateTaskLabels,
  }
}
