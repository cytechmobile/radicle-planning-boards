<script setup lang="ts">
import type { Task } from '~/types/tasks'

defineProps<{
  title: string
  tasks: Task[]
}>()

const board = useBoardStore()

function toggleRecentTasks() {
  board.state.filter.recentDoneTasks = !board.state.filter.recentDoneTasks
}

const button = computed(() =>
  board.state.filter.recentDoneTasks
    ? {
        label: 'Show all items',
        icon: 'bx:calendar-plus',
        class: 'text-rad-foreground-emphasized',
      }
    : {
        label: 'Show recent items',
        icon: 'bx:calendar-minus',
        class: 'text-rad-foreground-dim',
      },
)
</script>

<template>
  <Column :title="title" :tasks="tasks" is-required>
    <template #actions>
      <UTooltip :text="button.label">
        <IconButton v-bind="button" @click="toggleRecentTasks" />
      </UTooltip>
    </template>
  </Column>
</template>