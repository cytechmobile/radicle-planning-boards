import { type IncomingMessage, incomingMessageSchema } from '~/types/messages'

export function useRadicleInterfaceMessage<
  IncomingMessageType extends IncomingMessage['type'],
>(
  type: IncomingMessageType,
  callback: (message: Extract<IncomingMessage, { type: IncomingMessageType }>) => void,
) {
  const runtimeConfig = useRuntimeConfig()

  useEventListener('message', (event) => {
    if (event.origin !== runtimeConfig.public.parentOrigin) {
      return
    }

    const result = incomingMessageSchema.safeParse(event.data)
    if (!result.success || result.data.type !== type) {
      return
    }

    callback(result.data as Extract<IncomingMessage, { type: IncomingMessageType }>)
  })
}
