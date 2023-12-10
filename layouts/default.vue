<script setup lang="ts">
type Theme = 'light' | 'dark'

interface Message {
  type: 'theme'
  theme: Theme
}

function setTheme(theme: Theme) {
  document.documentElement.classList.remove('dark')
  document.documentElement.classList.remove('light')
  document.documentElement.classList.add(theme)
}

onMounted(() => {
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

