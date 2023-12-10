<script setup lang="ts">
type Theme = 'light' | 'dark'

interface Message {
  type: 'theme'
  theme: Theme
}

function setTheme(theme: Theme) {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme)
}

const { initialTheme } = useRoute().query

onMounted(() => {
  if (initialTheme && (initialTheme === 'light' || initialTheme === 'dark')) {
    setTheme(initialTheme)
  }

  window.addEventListener('message', (event: MessageEvent<Message>) => {
    switch (event.data.type) {
      case 'theme':
        setTheme(event.data.theme)
        break
      default:
    }
  })
})
</script>

<template>
  <main class="flex min-h-screen flex-col">
    <slot></slot>
  </main>
</template>

