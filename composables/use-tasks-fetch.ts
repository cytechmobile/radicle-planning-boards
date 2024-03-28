import type { RadicleIssue, RadiclePatch } from '~/types/httpd'
import type { Issue, Patch, Task } from '~/types/tasks'

export function useTasksFetch() {
  const { $httpd } = useNuxtApp()
  const route = useRoute('node-rid')
  const board = useBoardStore()

  async function fetchIssue(id: string): Promise<Issue> {
    const radicleIssue = await $httpd('/projects/{rid}/issues/{issue}', {
      path: { rid: route.params.rid, issue: id },
    })
    const issue = transformRadicleIssueToIssue(radicleIssue as RadicleIssue)

    return issue
  }

  async function fetchIssues(): Promise<Issue[]> {
    const issueStatuses = ['open', 'closed'] satisfies RadicleIssue['state']['status'][]

    const radicleIssuesByStatus = await Promise.all(
      issueStatuses.map(
        async (status) =>
          await $httpd('/projects/{rid}/issues', {
            path: {
              rid: route.params.rid,
            },
            // @ts-expect-error - wrong type definition
            query: { perPage: 1000, state: status },
          }),
      ),
    )

    const radicleIssues = radicleIssuesByStatus.flat()
    const issues = radicleIssues.map((issue) =>
      transformRadicleIssueToIssue(issue as RadicleIssue),
    )

    return issues
  }

  async function fetchPatch(id: string): Promise<Patch> {
    const radiclePatch = await $httpd('/projects/{rid}/patches/{patch}', {
      path: { rid: route.params.rid, patch: id },
    })
    const patch = transformRadiclePatchToPatch(radiclePatch as RadiclePatch)

    return patch
  }

  async function fetchPatches(): Promise<Patch[]> {
    const patchStatuses = [
      'draft',
      'open',
      'archived',
      'merged',
    ] satisfies RadiclePatch['state']['status'][]

    const radiclePatchesByStatus = await Promise.all(
      patchStatuses.map(
        async (status) =>
          await $httpd('/projects/{rid}/patches', {
            path: {
              rid: route.params.rid,
            },
            // @ts-expect-error - wrong type definition
            query: { perPage: 1000, state: status },
          }),
      ),
    )

    const radiclePatches = radiclePatchesByStatus.flat()
    const patches = radiclePatches.map((patch) =>
      transformRadiclePatchToPatch(patch as RadiclePatch),
    )

    return patches
  }

  async function refreshSpecificTasks(tasks: Task[]): Promise<void> {
    await Promise.all(
      tasks.map(async (task) => {
        switch (task.rpb.kind) {
          case 'issue':
            task = await fetchIssue(task.id)
            break
          case 'patch':
            task = await fetchPatch(task.id)
            break
          default:
            throw new Error('Unsupported task kind')
        }
      }),
    )
  }

  async function updateTaskLabels(task: Task, labels: string[]) {
    switch (task.rpb.kind) {
      case 'issue':
        return await $httpd(`/projects/{rid}/issues/{issue}`, {
          path: { rid: route.params.rid, issue: task.id },
          method: 'PATCH',
          body: {
            type: 'label',
            labels,
          },
        })
      case 'patch':
        return await $httpd(`/projects/{rid}/patches/{patch}`, {
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

  const {
    data: fetchedTasks,
    pending: areTasksPending,
    refresh: refreshTasks,
  } = useAsyncData('tasks', async () => {
    const issuesAndPatches = await Promise.all([fetchIssues(), fetchPatches()])
    const tasks = issuesAndPatches.flat()

    return tasks
  })

  const tasks = computed(() => {
    if (!fetchedTasks.value) {
      return null
    }

    if (!board.state.filter.taskKind) {
      return fetchedTasks.value
    }

    const filteredTasks = fetchedTasks.value.filter(
      (task) => board.state.filter.taskKind === task.rpb.kind,
    )

    return filteredTasks
  })

  return {
    tasks,
    areTasksPending,
    refreshTasks,
    refreshSpecificTasks,
    updateTaskLabels,
  }
}
