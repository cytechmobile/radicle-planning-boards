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
])

export type IncomingMessage = z.infer<typeof incomingMessageSchema>

export interface OutgoingMessage {
  type: 'request-auth-token'
}
