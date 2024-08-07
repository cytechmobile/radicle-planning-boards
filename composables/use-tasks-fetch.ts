import type { RadicleIssue, RadiclePatch } from '~/types/httpd'
import type { Issue, Patch, Task } from '~/types/tasks'

export function useTasksFetch() {
  const { $httpd } = useNuxtApp()
  const route = useRoute('node-rid')

  async function fetchIssueById(id: string): Promise<Issue> {
    const radicleIssue = await $httpd('/projects/{rid}/issues/{issue}', {
      path: { rid: route.params.rid, issue: id },
    })
    const issue = transformRadicleIssueToIssue(radicleIssue as RadicleIssue)

    return issue
  }

  async function fetchAllIssues(): Promise<Issue[]> {
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

  async function fetchAllPatches(): Promise<Patch[]> {
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

  const {
    data: tasks,
    pending: areTasksPending,
    refresh: refetchAllTasks,
  } = useAsyncData('tasks', async () => {
    const issuesAndPatches = await Promise.all([fetchAllIssues(), fetchAllPatches()])
    const tasks = issuesAndPatches.flat()

    return tasks
  })

  async function refetchTask(task: Task): Promise<void> {
    if (!tasks.value) {
      return
    }

    let refetchedTask: Task
    switch (task.rpb.kind) {
      case 'issue':
        refetchedTask = await fetchIssueById(task.id)
        break
      case 'patch':
        refetchedTask = await fetchPatchById(task.id)
        break
      default:
        throw new Error('Unsupported task kind')
    }

    const taskIndex = tasks.value.indexOf(task)
    if (taskIndex === undefined || taskIndex === -1) {
      return
    }

    tasks.value[taskIndex] = refetchedTask
  }

  async function refetchSpecificTasks(tasksToRefetch: Task[]): Promise<void> {
    await Promise.all(
      tasksToRefetch.map(async (task) => {
        await refetchTask(task)
      }),
    )
  }

  return {
    tasks,
    areTasksPending,
    refetchAllTasks,
    refetchSpecificTasks,
    updateTaskLabels,
  }
}
