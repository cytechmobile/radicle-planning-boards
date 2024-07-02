<script setup lang="ts">
interface Props {
  content: string | string[]
}

defineProps<Props>()
</script>


<template>
  <template v-if="typeof content === 'string'">
    {{ content }}
  </template>
  <template v-for="(segment, index) in content" v-else :key="index">
    <template v-if="isEven(index)">{{ segment }}</template>
    <mark v-else>{{ segment }}</mark>
  </template>
</template>