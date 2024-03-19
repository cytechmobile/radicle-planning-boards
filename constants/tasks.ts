import type { Task } from '~/types/tasks'

export const taskPriorityIncrement = 100

export const doneTaskStatuses: Task['state']['status'][] = ['closed', 'archived', 'merged']
