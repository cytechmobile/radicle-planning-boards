/**
 * Escapes special characters in a string so that it can be used in a regular expression.
 *
 * @param {string} string - The string to escape.
 * @returns The escaped string.
 *
 * @example
 * ```ts
 * escapeString('foo.bar') // 'foo\.bar'
 * ```
 */
export function escapeRegExp(string: string): string {
  const escapedString = string.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')

  return escapedString
}
