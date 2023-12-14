export function useTheme() {
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

  useEventListener(globalThis.window, 'message', (event: MessageEvent<Message>) => {
    if (event.data.type === 'theme') {
      setTheme(event.data.theme)
    }
  })
}
