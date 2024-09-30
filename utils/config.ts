import * as v from 'valibot'

interface Config {
  hostAppOrigin: string
}

const jsonConfigSchema = v.object({ hostAppOrigin: v.optional(v.string()) })

let config: Config | undefined

export async function resolveConfig(): Promise<Config> {
  if (config) {
    return config
  }

  const { hostAppOrigin: publicHostAppOrigin } = useRuntimeConfig().public
  const jsonConfig = await $fetch('/config.json').catch(() => undefined)
  const parseResult = v.safeParse(jsonConfigSchema, jsonConfig)

  if (parseResult.success) {
    const hostAppOrigin = parseResult.output.hostAppOrigin ?? publicHostAppOrigin
    config = { hostAppOrigin }
  } else {
    config = { hostAppOrigin: publicHostAppOrigin }
  }

  return config
}
