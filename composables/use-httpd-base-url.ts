const DEFAULT_HTTPD_BASE_URL = 'http://127.0.0.1:8080'

function useHttpdBaseUrl() {
  const route = useRoute()

  if (!route.params.node) {
    return DEFAULT_HTTPD_BASE_URL
  }

  const [hostname, port] = route.params.node.split(':')
  if (!hostname || !port) {
    return DEFAULT_HTTPD_BASE_URL
  }

  const scheme = port === '443' ? 'https' : 'http'

  const baseUrl = new URL(`${scheme}://127.0.0.1:8080`)
  baseUrl.hostname = hostname
  baseUrl.port = port
  baseUrl.pathname = '/api/v1'

  return baseUrl.toString()
}

export default useHttpdBaseUrl
