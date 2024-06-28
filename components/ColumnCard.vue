<script setup lang="ts">
import { taskTruncatedIdLength } from '~/constants/tasks'

interface Props {
  id: string
  title: string
  labels: string[]
  status: {
    name: string
    icon: {
      name: string
      class: string
    }
  }
  href: string
  query?: RegExp
}

defineProps<Props>()

// TODO: zac check whether this is safe and if not, fix it
function getHighlightedText(text: string, query: RegExp | undefined) {
  if (!query) {
    return text
  }

  return text.replace(query, (match) => {
    return `<mark>${match}</mark>`
  })
}
</script>

<!-- eslint-disable vue/no-v-html -->
<template>
  <article
    class="group flex flex-col gap-1 rounded-sm border border-rad-border-hint bg-rad-background-float p-3 transition-opacity hover:bg-rad-fill-float-hover"
  >
    <small class="flex items-center gap-2">
      <span class="sr-only">{{ status.name }}</span>
      <UTooltip :text="status.name" :popper="{ placement: 'top' }">
        <Icon :name="status.icon.name" size="16" :class="status.icon.class" />
      </UTooltip>

      <pre
        class="text-xs font-medium text-rad-foreground-emphasized"
        v-html="getHighlightedText(id.slice(0, taskTruncatedIdLength), query)"
      ></pre>
    </small>

    <h4>
      <a
        :href="href"
        target="_blank"
        class="w-fit text-sm hover:underline"
        v-html="getHighlightedText(title, query)"
      ></a>
    </h4>

    <ul v-if="labels.length > 0" class="flex flex-wrap gap-2">
      <li
        v-for="label in labels"
        :key="label"
        class="mt-2 rounded-full bg-rad-fill-ghost px-2 py-1 text-xs font-semibold text-rad-foreground-contrast group-hover:bg-rad-background-float"
        v-html="getHighlightedText(label, query)"
      ></li>
    </ul>
  </article>
</template>
