<script setup lang="ts">
import { taskTruncatedIdLength } from '~/constants/tasks'
import type { TaskHighlights } from '~/types/tasks'

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
  highlights?: TaskHighlights
}

defineProps<Props>()

/**
 * Truncates segmented text based on a character limit.
 *
 * @param {string[]} segments - The segmented text to truncate.
 * @param {number} limit - The character limit.
 * @returns The truncated segmented text.
 *
 * @example
 * ```ts
 * truncateSegmentedText(['foo', 'bar'], 5) // ['foo', 'ba']
 * ```
 */
function truncateSegmentedText(segments: string[], limit: number): string[] {
  const truncatedText = []
  let currentLength = 0

  for (const segment of segments) {
    if (currentLength + segment.length > limit) {
      truncatedText.push(segment.slice(0, limit - currentLength))
      break
    }

    truncatedText.push(segment)
    currentLength += segment.length
  }

  return truncatedText
}
</script>

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
      ><TextWithHighlights :content="highlights?.id ? truncateSegmentedText(highlights?.id, taskTruncatedIdLength) :  id.slice(0, taskTruncatedIdLength)" /></pre>
    </small>

    <h4>
      <a :href="href" target="_blank" class="w-fit text-sm hover:underline">
        <TextWithHighlights :content="highlights?.title ?? title" />
      </a>
    </h4>

    <ul v-if="labels.length > 0" class="flex flex-wrap gap-2">
      <li
        v-for="(label, index) in highlights?.labels ?? labels"
        :key="labels[index]"
        class="mt-2 rounded-full bg-rad-fill-ghost px-2 py-1 text-xs font-semibold text-rad-foreground-contrast group-hover:bg-rad-background-float"
      >
        <TextWithHighlights :content="label" />
      </li>
    </ul>
  </article>
</template>
