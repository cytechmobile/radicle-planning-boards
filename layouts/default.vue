<script setup lang="ts">
type Theme = 'light' | 'dark'

interface Message {
  type: 'theme'
  theme: Theme
}

const isDark = useDark()
const toggleDark = useToggle(isDark)

function setTheme(theme: Theme) {
  toggleDark(theme === 'dark')
}

const { initialTheme } = useRoute().query

onMounted(() => {
  if (initialTheme === 'light' || initialTheme === 'dark') {
    setTheme(initialTheme)
  }
})

useEventListener(window, 'message', (event: MessageEvent<Message>) => {
  if (event.data.type === 'theme') {
    setTheme(event.data.theme)
  }
})
</script>

<template>
  <main class="flex min-h-screen flex-col">
    <slot></slot>
  </main>
</template>

