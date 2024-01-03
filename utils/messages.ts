import { radicleInterfaceOrigin } from '~/constants/config'
import type { OutgoingMessage } from '~/types/messages'

export function postMessageToRadicleInterface(message: OutgoingMessage): void {
  globalThis.window.parent.postMessage(message, radicleInterfaceOrigin)
}
