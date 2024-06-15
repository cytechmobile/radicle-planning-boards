import type { RadicleIssue, RadiclePatch } from '~/types/httpd'
import type { Issue, Patch, Task } from '~/types/tasks'

export function useTasksFetch() {
  const { $httpd } = useNuxtApp()
  const route = useRoute('node-rid')
  const board = useBoardStore()

  const {
    data: fetchedTasks,
    pending: areTasksPending,
    refresh: refreshAllTasks,
  } = useAsyncData('tasks', async () => {
    const issuesAndPatches = await Promise.all([fetchIssues(), fetchPatches()])
    const tasks = issuesAndPatches.flat()

    return tasks
  })

  const tasks = computed(() => {
    if (!fetchedTasks.value) {
      return null
    }

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const filteredTasks = fetchedTasks.value.filter((task) => {
      // Filter by task kind
      if (board.state.filter.taskKind && board.state.filter.taskKind !== task.rpb.kind) {
        return false
      }

      // Filter done tasks by date
      if (
        board.state.filter.recentDoneTasks &&
        isTaskDone(task) &&
        task.rpb.relevantDate < twoWeeksAgo
      ) {
        return false
      }

      return true
    })

    return filteredTasks
  })

  async function fetchIssueById(id: string): Promise<Issue> {
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

  async function fetchPatchById(id: string): Promise<Patch> {
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

  async function refreshSpecificTasks(tasks: Task[]): Promise<void> {
    if (!fetchedTasks.value) {
      return
    }

    const refreshedTasks = await Promise.all(
      tasks.map(async (task) => {
        switch (task.rpb.kind) {
          case 'issue':
            return await fetchIssueById(task.id)
          case 'patch':
            return await fetchPatchById(task.id)
          default:
            throw new Error('Unsupported task kind')
        }
      }),
    )

    for (const refreshedTask of refreshedTasks) {
      const taskIndex = fetchedTasks.value?.findIndex(
        (fetchedTask) => fetchedTask.id === refreshedTask.id,
      )

      if (taskIndex === undefined || taskIndex === -1) {
        return
      }

      fetchedTasks.value.splice(taskIndex, 1, refreshedTask)
    }
  }

  return {
    tasks,
    areTasksPending,
    refreshAllTasks,
    refreshSpecificTasks,
    updateTaskLabels,
  }
}
