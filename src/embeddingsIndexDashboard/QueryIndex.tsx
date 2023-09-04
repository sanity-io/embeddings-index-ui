import {SearchIcon} from '@sanity/icons'
import {Box, Card, Flex, Spinner, Stack, Text, TextInput} from '@sanity/ui'
import {FormEvent, useCallback, useState, KeyboardEvent} from 'react'
import {DocumentPreview} from '../preview/DocumentPreview'
import {queryIndex, QueryResult} from '../api/embeddingsApi'
import {useApiClient} from '../api/embeddingsApiHooks'

const NO_RESULTS: QueryResult[] = []

export function QueryIndex(props: {indexName: string}) {
  const {indexName} = props
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(NO_RESULTS)

  const client = useApiClient()

  const search = useCallback(
    (queryString: string) => {
      setSearching(true)
      return queryIndex(
        {
          query: queryString,
          indexName,
          maxResults: 5,
        },
        client,
      )
        .then(setResults)
        .finally(() => setSearching(false))
    },
    [client, indexName],
  )

  const onInputChange = useCallback((e: FormEvent<HTMLInputElement>) => {
    setQuery(e.currentTarget.value)
  }, [])

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        search(query).catch(console.error)
      }
    },
    [search, query],
  )

  return (
    <Stack space={3} flex={1}>
      <Flex flex={1}>
        <Card flex={1}>
          <TextInput
            iconRight={
              searching ? (
                <Box style={{marginTop: 5}}>
                  <Spinner />
                </Box>
              ) : (
                SearchIcon
              )
            }
            placeholder={'Find documents'}
            value={query}
            disabled={searching}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
          />
        </Card>
      </Flex>
      <Flex gap={4} style={{opacity: searching ? 0.5 : 1}}>
        <Box flex={1}>
          <ResultList results={results} query={query} />
        </Box>
      </Flex>
    </Stack>
  )
}

export function ResultList(props: {results: QueryResult[]; query: string}) {
  const {results, query} = props

  return (
    <Stack space={4} height="fill">
      <Stack space={2}>
        {results.map((r) => (
          <ResultEntry result={r} key={r.value.documentId} />
        ))}
        {!results.length && query ? 'No results.' : null}
      </Stack>
    </Stack>
  )
}

function ResultEntry(props: {result: QueryResult}) {
  const value = props.result.value
  return (
    <Flex gap={4} align="center">
      <Box flex={1}>
        <DocumentPreview documentId={value.documentId} schemaTypeName={value.type} button />
      </Box>
      <Box>
        <Text muted size={1}>
          {Math.floor(props.result.score * 100)} %
        </Text>
      </Box>
    </Flex>
  )
}
