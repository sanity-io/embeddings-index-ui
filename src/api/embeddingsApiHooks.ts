import {SanityClient, useClient} from 'sanity'
import {useMemo} from 'react'

export function useApiClient(
  customApiClient?: (defaultClient: SanityClient) => SanityClient,
): SanityClient {
  const client = useClient({apiVersion: 'vX'})
  return useMemo(
    () => (customApiClient ? customApiClient(client) : client),
    [client, customApiClient],
  )
}
