import type { DeepRequired } from 'ts-essentials'
// eslint-disable-next-line max-len
import type { components as httpdApiComponents } from '#build/types/nuxt-open-fetch/schemas/httpd'

// Not 100% accurate, but good enough for now
export type RadicleIssue = DeepRequired<httpdApiComponents['schemas']['Issue']> & {
  state: {
    status: 'open' | 'closed'
  }
}

export type RadiclePatch = DeepRequired<httpdApiComponents['schemas']['Patch']> & {
  state: {
    status: 'draft' | 'open' | 'archived' | 'merged'
  }
}
