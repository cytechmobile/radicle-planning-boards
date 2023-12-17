import { useRadicleInterfaceMessage } from './use-radicle-interface-message'

export function useTheme() {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)

  function setTheme(theme: 'light' | 'dark') {
    toggleDark(theme === 'dark')
  }

  const { initialTheme } = useRoute().query

  onMounted(() => {
    if (initialTheme === 'light' || initialTheme === 'dark') {
      setTheme(initialTheme)
    }
  })

  useRadicleInterfaceMessage('theme', (message) => {
    setTheme(message.theme)
  })
}
