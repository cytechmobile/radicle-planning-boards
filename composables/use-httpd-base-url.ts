const defaultHttpdBaseUrl = 'http://127.0.0.1:8080'

export function useHttpdBaseUrl() {
  const route = useRoute('node-rid')

  if (!route.params.node) {
    return defaultHttpdBaseUrl
  }

  const [hostname, port] = route.params.node.split(':')
  if (!hostname || !port) {
    return defaultHttpdBaseUrl
  }

  const scheme = port === '443' ? 'https' : 'http'

  const baseUrl = new URL(`${scheme}://127.0.0.1:8080`)
  baseUrl.hostname = hostname
  baseUrl.port = port
  baseUrl.pathname = '/api/v1'

  return baseUrl.toString()
}
