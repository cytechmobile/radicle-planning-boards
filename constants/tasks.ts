import type { Task } from '~/types/tasks'

export const doneTaskStatuses: Task['state']['status'][] = ['closed', 'archived', 'merged']
