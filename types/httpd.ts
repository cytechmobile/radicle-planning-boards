import type { DeepRequired } from 'ts-essentials'
import type { components as httpdApiComponents } from '#build/types/nuxt-open-fetch/httpd'

// Not 100% accurate, but good enough for now
export type Issue = DeepRequired<httpdApiComponents['schemas']['Issue']> & {
  state: {
    status: 'open' | 'closed'
  }
}
