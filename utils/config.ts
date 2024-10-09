import * as v from 'valibot'

interface Config {
  hostAppOrigin: string
}

const configSchema = v.object({ hostAppOrigin: v.optional(v.string()) })

let config: Config | undefined

export async function resolveConfig(): Promise<Config> {
  if (config) {
    return config
  }

  const { hostAppOrigin: publicHostAppOrigin } = useRuntimeConfig().public
  const fetchedConfig = await $fetch('/config.json').catch(() => undefined)
  const configParseResult = v.safeParse(configSchema, fetchedConfig)

  if (configParseResult.success) {
    const hostAppOrigin = configParseResult.output.hostAppOrigin ?? publicHostAppOrigin
    config = { hostAppOrigin }
  } else {
    config = { hostAppOrigin: publicHostAppOrigin }
  }

  return config
}
