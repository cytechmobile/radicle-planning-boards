export function initializeArrayForKey<Value>(
  object: Record<string, Value[]>,
  key: string,
): Value[] {
  if (!object[key]) {
    object[key] = []
  }

  return object[key] as Value[]
}
