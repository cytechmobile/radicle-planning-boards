<script setup lang="ts">
const board = useBoardStore()

const options = ['All', 'Issues', 'Patches'] as const
type Option = (typeof options)[number]

const optionIcons = {
  All: 'bx:bxs-circle',
  Issues: 'octicon:issue-opened-16',
  Patches: 'octicon:git-pull-request-16',
}

const selected = computed(() => {
  const { taskKind } = board.state.filter
  if (!taskKind) {
    return 'All'
  }

  if (taskKind === 'issue') {
    return 'Issues'
  }

  if (taskKind === 'patch') {
    return 'Patches'
  }

  throw new Error(`Invalid task kind: ${taskKind}`)
})

function handleChange(selected: (typeof options)[number]) {
  switch (selected) {
    case 'All':
      board.state.filter.taskKind = undefined
      break
    case 'Issues':
      board.state.filter.taskKind = 'issue'
      break
    case 'Patches':
      board.state.filter.taskKind = 'patch'
      break
    default:
      throw new Error(`Invalid selected option: ${selected}`)
  }
}
</script>

<template>
  <USelectMenu
    :model-value="selected"
    :options="options"
    size="sm"
    :ui-menu="{
      background: 'bg-rad-background-float dark:bg-rad-background-float',
      option: {
        color: 'text-rad-foreground-contrast dark:text-rad-foreground-contrast',
        active: 'bg-rad-fill-ghost-hover dark:bg-fill-ghost-hover',
      },
    }"
    :ui="{
      color: {
        white: {
          outline:
            'bg-rad-background-float dark:bg-rad-background-float ring-rad-border-hint dark:ring-rad-border-hint text-rad-foreground-contrast dark:text-rad-foreground-contrast',
        },
      },
    }"
    @change="handleChange"
  >
    <template #label>
      <span class="flex items-center gap-2">
        <Icon :name="optionIcons[selected]" size="16" class="text-rad-foreground-dim" />
        {{ selected }}
      </span>
    </template>

    <template #option="{ option }">
      <span class="flex items-center gap-2">
        <Icon
          :name="optionIcons[option as Option]"
          size="16"
          class="text-rad-foreground-dim"
        />
        {{ option }}
      </span>
    </template>
  </USelectMenu>
</template>