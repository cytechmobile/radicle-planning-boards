<script setup lang="ts">
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
}

defineProps<Props>()
</script>

<template>
  <article
    class="flex flex-col gap-1 rounded-sm border border-rad-border-hint bg-rad-background-float p-3 transition-opacity hover:bg-rad-fill-float-hover"
  >
    <small class="flex items-center gap-2">
      <span class="sr-only">{{ status.name }}</span>
      <UTooltip :text="status.name" :popper="{ placement: 'top' }">
        <Icon :name="status.icon.name" size="16" :class="status.icon.class" />
      </UTooltip>
      <pre class="text-xs font-medium text-rad-foreground-emphasized">{{
        id.slice(0, 7)
      }}</pre>
    </small>

    <h4>
      <a :href="href" target="_blank" class="w-fit text-sm hover:underline">
        {{ title }}
      </a>
    </h4>

    <ul v-if="labels.length > 0">
      <li
        v-for="label in labels"
        :key="label"
        class="mt-2 text-xs font-bold text-rad-foreground-emphasized"
      >
        {{ label }}
      </li>
    </ul>
  </article>
</template>
