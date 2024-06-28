/**
 * Escapes any special characters from a string and converts it to a regular expression.
 *
 * @param {string} string - The string to convert to a regular expression.
 * @param {string} [flags] - Optional flags to be applied to the regular expression.
 * @returns A regular expression object.
 *
 * @example
 * ```ts
 * toRegExp('foo.bar') // /foo\.bar/
 * ```
 *
 * @example
 * ```ts
 * toRegExp('foo.bar', 'i') // /foo\.bar/i
 * ```
 */
export function toRegExp(string: string, flags?: string): RegExp {
  const escapedString = string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')
  const regExp = new RegExp(escapedString, flags)

  return regExp
}
