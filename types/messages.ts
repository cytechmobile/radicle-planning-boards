import * as v from 'valibot'

export const incomingMessageSchema = v.union([
  v.object({
    type: v.literal('theme'),
    theme: v.picklist(['light', 'dark']),
  }),
  v.object({
    type: v.literal('set-auth-token'),
    authToken: v.string(),
  }),
  v.object({
    type: v.literal('remove-auth-token'),
  }),
  v.object({
    type: v.literal('query-params-updated'),
    queryParams: v.record(v.string(), v.string()),
  }),
])

export type IncomingMessage = v.InferInput<typeof incomingMessageSchema>

export type OutgoingMessage =
  | { type: 'request-auth-token' }
  | { type: 'request-query-params' }
  | { type: 'set-query-params'; queryParams: Record<string, string | undefined> }
