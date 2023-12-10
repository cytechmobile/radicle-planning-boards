const PER_PAGE = 100

function createHttpdBaseURL(domainName = 'seed.radicle.xyz') {
  return `https://${domainName}/api/v1`
}

interface FetchOptions {
  domainName?: string
}

interface UseFetchIssuesOptions extends FetchOptions {
  rid: string
}

export async function useFetchIssues({ rid, domainName }: UseFetchIssuesOptions) {
  return await useHttpdFetch('/projects/{rid}/issues', {
    path: { rid },
    baseURL: createHttpdBaseURL(domainName),
    // @ts-expect-error - query params are not typed
    query: { perPage: PER_PAGE },
  })
}
