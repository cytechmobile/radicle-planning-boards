/**
 * Checks if the current page is loaded inside an iframe.
 * @returns A boolean value indicating whether the page is loaded inside an iframe.
 */
export function inIframe(): boolean {
  try {
    return globalThis.self !== globalThis.top
  } catch {
    return true
  }
}
