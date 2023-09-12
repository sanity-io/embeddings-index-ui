import {SanityClient, useClient} from 'sanity'
import {useMemo} from 'react'

export function useApiClient(): SanityClient {
  const client = useClient({apiVersion: 'vX'})
  return useMemo(() => {
    const customHost = localStorage.getItem('embeddings-index-host')
    if (customHost) {
      return client.withConfig({
        apiHost: customHost,
        useProjectHostname: false,
        withCredentials: false,
      })
    }
    return client
  }, [client])
}
