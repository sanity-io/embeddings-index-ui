import {useClient} from 'sanity'
import {createContext, PropsWithChildren, useContext, useEffect, useState} from 'react'
import {Card, Text} from '@sanity/ui'

const featureName = 'embeddingsIndexApi'

export type FeatureStatus = 'enabled' | 'disabled' | 'loading'
export const FeatureEnabledContext = createContext<FeatureStatus>('loading')

export function useIsFeatureEnabled() {
  const client = useClient({apiVersion: '2023-09-01'})
  const [status, setStatus] = useState<FeatureStatus>('loading')

  useEffect(() => {
    client
      .request<string | boolean>({
        method: 'GET',
        url: `/projects/${client.config().projectId}/features/${featureName}`,
      })
      .then((isEnabled) => {
        setStatus(isEnabled === 'true' || isEnabled === true ? 'enabled' : 'disabled')
      })
      .catch((err) => {
        console.error(err)
        setStatus('disabled')
      })
  }, [client])

  return status
}

export function FeatureEnabledProvider(props: PropsWithChildren<{}>) {
  const status = useIsFeatureEnabled()
  return (
    <FeatureEnabledContext.Provider value={status}>{props.children}</FeatureEnabledContext.Provider>
  )
}

export function useIsFeatureEnabledContext(): FeatureStatus {
  return useContext(FeatureEnabledContext)
}

export function FeatureDisabledNotice() {
  return (
    <Card tone="primary" border padding={2}>
      <Text size={1}>
        Embeddings index APIs are only available on the{' '}
        <a href="https://sanity.io/pricing">Team tier and above</a>. Please upgrade to enable
        access.
      </Text>
    </Card>
  )
}
