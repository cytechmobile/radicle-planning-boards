import type { OutgoingMessage } from '~/types/messages'

export function usePostMessageToRadicleInterface() {
  const runtimeConfig = useRuntimeConfig()

  return function postMessageToRadicleInterface(message: OutgoingMessage): void {
    globalThis.window.parent.postMessage(message, runtimeConfig.public.parentOrigin)
  }
}
