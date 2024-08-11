import {
  type IncomingMessage,
  type OutgoingMessage,
  incomingMessageSchema,
} from '~/types/messages'

export function useHostAppMessage() {
  const { parentOrigin } = useRuntimeConfig().public

  function onHostAppMessage<IncomingMessageType extends IncomingMessage['type']>(
    type: IncomingMessageType,
    callback: (message: Extract<IncomingMessage, { type: IncomingMessageType }>) => void,
  ): void {
    useEventListener('message', (event) => {
      if (event.origin !== parentOrigin) {
        return
      }

      const result = incomingMessageSchema.safeParse(event.data)
      if (!result.success || result.data.type !== type) {
        return
      }

      callback(result.data as Extract<IncomingMessage, { type: IncomingMessageType }>)
    })
  }

  function postMessageToHostApp(message: OutgoingMessage): void {
    globalThis.window.parent.postMessage(message, parentOrigin)
  }

  return {
    onHostAppMessage,
    postMessageToHostApp,
  }
}
