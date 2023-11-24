<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

defineProps<{ title: string; modelValue: unknown[] }>()
</script>

<template>
  <div
    class="flex min-w-[350px] max-w-[350px] flex-1 flex-col rounded border border-rad-border-hint bg-rad-background-dip"
  >
    <h3 class="p-2 text-xl font-semibold capitalize">{{ title }}</h3>

    <VueDraggable
      tag="ul"
      class="flex flex-1 flex-col gap-2 p-2"
      v-bind="$attrs"
      :model-value="modelValue"
      ghost-class="opacity-50"
      :animation="150"
    >
      <slot></slot>
    </VueDraggable>
  </div>
</template>
