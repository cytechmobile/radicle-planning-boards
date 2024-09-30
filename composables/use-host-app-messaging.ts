import * as v from 'valibot'

type Message<
  Type extends string,
  Payload extends object | undefined = undefined,
> = Payload extends object ? { type: Type } & Payload : { type: Type }

export type MessageToHostApp =
  | Message<'request-auth-token'>
  | Message<'request-query-params'>
  | Message<'set-query-params', { queryParams: Record<string, string | undefined> }>

const messageFromHostApp = v.union([
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

export type MessageFromHostApp = v.InferInput<typeof messageFromHostApp>

export function useHostAppMessaging() {
  function onHostAppMessage<MessageType extends MessageFromHostApp['type']>(
    type: MessageType,
    callback: (message: Extract<MessageFromHostApp, { type: MessageType }>) => void,
  ): void {
    useEventListener('message', async (event) => {
      const { hostAppOrigin } = await resolveConfig()
      if (event.origin !== hostAppOrigin) {
        return
      }

      const result = v.safeParse(messageFromHostApp, event.data)
      if (!result.success || result.output.type !== type) {
        return
      }

      callback(result.output as Extract<MessageFromHostApp, { type: MessageType }>)
    })
  }

  async function notifyHostApp(message: MessageToHostApp): Promise<void> {
    const { hostAppOrigin } = await resolveConfig()
    globalThis.window.parent.postMessage(message, hostAppOrigin)
  }

  return {
    onHostAppMessage,
    notifyHostApp,
  }
}
