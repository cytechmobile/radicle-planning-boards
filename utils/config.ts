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
  const configFileUrl = new URL('/config.json', globalThis.location.origin)

  if (configParseResult.success) {
    const hostAppOrigin = configParseResult.output.hostAppOrigin ?? publicHostAppOrigin
    config = { hostAppOrigin }
    // eslint-disable-next-line no-console
    console.info(`Successfully loaded config from "${configFileUrl}":`, config)
  } else {
    config = { hostAppOrigin: publicHostAppOrigin }

    if (typeof fetchedConfig === 'object') {
      console.warn(
        `Failed parsing config from "${configFileUrl}". Falling back to default config`,
        '\nDefault config:',
        config,
        `\nIssues with "${configFileUrl}":`,
        v.flatten(configParseResult.issues),
      )
    } else {
      console.warn(
        `Failed loading config from "${configFileUrl}". Falling back to default config`,
        '\nDefault config:',
        config,
      )
    }
  }

  return config
}
