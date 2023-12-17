import z from 'zod'

export const incomingMessageSchema = z.union([
  z.object({
    type: z.literal('theme'),
    theme: z.enum(['light', 'dark']),
  }),
  z.object({
    type: z.literal('auth-token'),
    authToken: z.string(),
  }),
])

export type IncomingMessage = z.infer<typeof incomingMessageSchema>

export interface OutgoingMessage {
  type: 'auth-token'
}
