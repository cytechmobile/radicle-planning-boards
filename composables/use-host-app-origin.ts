import { defaultHostAppOrigin } from '~/constants/config'

export function useHostAppOrigin(): string {
  const { data: hostAppOrigin } = useAsyncData('config', resolveConfig, {
    transform: (config) => config.hostAppOrigin,
  })

  return hostAppOrigin.value ?? defaultHostAppOrigin
}
