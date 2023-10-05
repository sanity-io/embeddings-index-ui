import {useProjectId} from 'sanity'
import {createContext, PropsWithChildren, useContext, useEffect, useState} from 'react'
import {Card, Text} from '@sanity/ui'
import {useApiClient} from './embeddingsApiHooks'

export type FeatureStatus = 'enabled' | 'disabled' | 'loading'
export const FeatureEnabledContext = createContext<FeatureStatus>('loading')

export function useIsFeatureEnabled() {
  const client = useApiClient()
  const [status, setStatus] = useState<FeatureStatus>('loading')

  useEffect(() => {
    client
      .request<{enabled: boolean}>({
        method: 'GET',
        url: `/embeddings-index/status`,
      })
      .then((response) => {
        setStatus(response.enabled ? 'enabled' : 'disabled')
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

export function FeatureDisabledNotice(props: {urlSuffix?: string}) {
  const projectId = useProjectId()

  return (
    <Card tone="primary" border padding={4}>
      <Text size={1}>
        💎 Unlock semantic search with the Embeddings Index API — available on Team, Business, and
        Enterprise plans.{' '}
        <a href={`https://www.sanity.io/manage/project/${projectId}/plan${props.urlSuffix ?? ''}`}>
          Upgrade now →
        </a>
      </Text>
    </Card>
  )
}
