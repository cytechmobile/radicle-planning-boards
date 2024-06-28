import z from 'zod'

export const incomingMessageSchema = z.union([
  z.object({
    type: z.literal('theme'),
    theme: z.enum(['light', 'dark']),
  }),
  z.object({
    type: z.literal('set-auth-token'),
    authToken: z.string(),
  }),
  z.object({
    type: z.literal('remove-auth-token'),
  }),
  z.object({
    type: z.literal('query-params-updated'),
    queryParams: z.record(z.string(), z.string()),
  }),
])

export type IncomingMessage = z.infer<typeof incomingMessageSchema>

export type OutgoingMessage =
  | { type: 'request-auth-token' }
  | { type: 'request-query-params' }
  | { type: 'set-query-params'; queryParams: Record<string, string | undefined> }
