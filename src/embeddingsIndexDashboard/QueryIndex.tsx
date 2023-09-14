import {useCallback, useMemo} from 'react'
import {SemanticSearchAutocomplete} from '../referenceInput/SemanticSearchAutocomplete'
import {EmbeddingsIndexConfig} from '../schemas/typeDefExtensions'

export function QueryIndex(props: {indexName: string}) {
  const {indexName} = props
  const getEmpty = useCallback(() => 'anything', [])
  const indexConfig: EmbeddingsIndexConfig = useMemo(
    () => ({indexName, maxResults: 8}),
    [indexName],
  )
  return <SemanticSearchAutocomplete getEmptySearchValue={getEmpty} indexConfig={indexConfig} />
}
