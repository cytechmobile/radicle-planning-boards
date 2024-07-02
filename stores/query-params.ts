import { debounceFilter } from '@vueuse/core'

interface QueryParams extends Record<string, string | undefined> {
  filter?: string
}

export const useQueryParamsStore = defineStore('query-params', () => {
  const isInIframe = inIframe()

  if (!isInIframe) {
    const queryParams = useUrlSearchParams<QueryParams>('history')

    return { queryParams }
  }

  const hostAppQueryParams = reactive<QueryParams>({})
  const postMessage = usePostMessageToRadicleInterface()

  onMounted(() => {
    postMessage({ type: 'request-query-params' })
  })

  const { pause, resume } = watchPausable(
    hostAppQueryParams,
    () => {
      postMessage({
        type: 'set-query-params',
        // ! Sending the reactive object directly causes an object cloning error
        queryParams: Object.assign({}, hostAppQueryParams),
      })
    },
    // ! Debouncing is required to:
    // - Prevent an infinite loop when too many changes happen in a short time
    // - Avoid spamming the host app with too many messages
    { eventFilter: debounceFilter(500) },
  )

  useRadicleInterfaceMessage('query-params-updated', (message) => {
    pause()

    const unusedKeys = Object.keys(hostAppQueryParams)

    for (const [key, value] of Object.entries(message.queryParams)) {
      hostAppQueryParams[key] = value

      const keyIndex = unusedKeys.indexOf(key)
      if (keyIndex !== -1) {
        unusedKeys.splice(keyIndex, 1)
      }
    }

    unusedKeys.forEach((key) => delete hostAppQueryParams[key])

    resume()
  })

  return {
    queryParams: hostAppQueryParams,
  }
})
