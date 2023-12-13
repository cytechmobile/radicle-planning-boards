import type { DeepRequired } from 'ts-essentials'
import type { ISSUE_STATUSES } from '~/constants/issues'
import type { components as httpdApiComponents } from '#build/types/nuxt-open-fetch/httpd'

export type IssueStatus = (typeof ISSUE_STATUSES)[number]

// Not 100% accurate, but good enough for now
export type Issue = DeepRequired<httpdApiComponents['schemas']['Issue']>
