import {
  ObjectInputProps,
  ReferenceBaseOptions,
  ReferenceSchemaType,
  set,
  setIfMissing,
  typed,
  unset,
} from 'sanity'
import {
  Autocomplete,
  Box,
  Button,
  Flex,
  Text,
  AutocompleteOpenButtonProps,
  Spinner,
} from '@sanity/ui'
import {EarthGlobeIcon, LinkIcon} from '@sanity/icons'
import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react'
import {DocumentPreview} from '../preview/DocumentPreview'
import {useDocumentPane} from 'sanity/desk'
import {queryIndex, QueryResult} from '../api/embeddingsApi'
import {publicId} from '../utils/id'
import {useApiClient} from '../api/embeddingsApiHooks'
import {FeatureDisabledNotice, useIsFeatureEnabledContext} from '../api/isEnabled'
import {EmbeddingsIndexConfig} from '../schemas/typeDefExtensions'

interface Option {
  result: QueryResult
  value: string
}

const NO_OPTIONS: Option[] = []
const NO_FILTER = () => true

function useEmeddingsConfig(
  embeddingsIndexConfig: ReferenceBaseOptions['embeddingsIndex'],
  defaultConfig: EmbeddingsIndexConfig | undefined,
) {
  return useMemo(() => {
    if (embeddingsIndexConfig === true || !embeddingsIndexConfig) {
      if (!defaultConfig?.indexName) {
        throw new Error(
          'Default embeddingsIndex config is missing. When options.embeddingsIndex: true, embeddingsIndexReferenceInput plugin config is required.',
        )
      }
      return defaultConfig
    }

    const finalConfig = {
      ...defaultConfig,
      ...embeddingsIndexConfig,
    }

    if (!finalConfig?.indexName) {
      throw new Error(
        'indexName is missing. Either set it in options.embeddingsIndex or configure defaults using plugin config.',
      )
    }

    return finalConfig
  }, [defaultConfig, embeddingsIndexConfig])
}

export function SemanticSearchReferenceInput(
  props: ObjectInputProps & {defaultConfig?: EmbeddingsIndexConfig},
) {
  const embeddingsIndexConfig = (props.schemaType as ReferenceSchemaType)?.options?.embeddingsIndex

  const config = useEmeddingsConfig(embeddingsIndexConfig, props.defaultConfig)

  const defaultEnabled = config.searchMode === 'embeddings'

  const featureState = useIsFeatureEnabledContext()

  const [semantic, setSemantic] = useState<boolean>(defaultEnabled)
  const toggleSemantic = useCallback(() => setSemantic((current) => !current), [])

  return (
    <Flex gap={2} flex={1} style={{width: '100%'}}>
      {semantic && featureState == 'loading' ? (
        <Box padding={2}>
          <Spinner />
        </Box>
      ) : null}

      {semantic && featureState == 'disabled' ? <FeatureDisabledNotice /> : null}

      <Box flex={1} style={{maxHeight: 36, overflow: 'hidden'}}>
        {semantic && featureState == 'enabled' ? (
          <SemanticSearchInput {...props} indexConfig={config} />
        ) : (
          props.renderDefault(props)
        )}
      </Box>
      <Button
        icon={semantic ? EarthGlobeIcon : LinkIcon}
        onClick={toggleSemantic}
        mode="bleed"
        title={
          semantic ? 'Switch to standard reference search' : 'Switch to semantic reference search'
        }
      />
    </Flex>
  )
}

function useDebouncedValue<T>(value: T, ms: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value)
    }, ms)
    return () => clearTimeout(timeoutId)
  }, [value, ms])

  return debouncedValue
}

function SemanticSearchInput(props: ObjectInputProps & {indexConfig: EmbeddingsIndexConfig}) {
  const {indexConfig, onPathFocus, onChange, readOnly, schemaType, value} = props

  const {value: currentDocument} = useDocumentPane()
  const docRef = useRef(currentDocument)
  const autocompleteRef = useRef<HTMLInputElement>(null)

  const id = useId()

  const [query, setQuery] = useState('')
  const queryRef = useRef(query)
  const debouncedQuery = useDebouncedValue(query, 300)
  const prevDebouncedQuery = useRef(debouncedQuery)

  const [searching, setSearching] = useState(false)
  const [options, setOptions] = useState(NO_OPTIONS)

  const client = useApiClient()

  useEffect(() => {
    docRef.current = currentDocument
  }, [currentDocument])

  useEffect(() => {
    // if this component is rendered, and there is a value, replace was selected
    if (value?._ref) {
      autocompleteRef.current?.focus()
    }
    // intentional empty deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFocus = useCallback(() => onPathFocus(['_ref']), [onPathFocus])
  const handleBlur = useCallback(() => onPathFocus([]), [onPathFocus])

  const runIndexQuery = useCallback(
    (queryString: string) => {
      setSearching(true)
      const refSchema = schemaType as ReferenceSchemaType
      const indexName = indexConfig?.indexName
      const maxResults = indexConfig?.maxResults
      const typeFilter = refSchema.to.map((ref) => ref.name)

      if (!indexName) {
        throw new Error(
          `Reference option embeddingsIndex.indexName is required, but was missing in type ${refSchema.name}`,
        )
      }

      queryIndex(
        {
          query: queryString.trim().length ? queryString : JSON.stringify(docRef.current) ?? '',
          indexName,
          maxResults,
          filter: {
            type: typeFilter,
          },
        },
        client,
      )
        .then((result: QueryResult[]) => {
          if (queryRef.current === queryString) {
            setSearching(false)
            setOptions(
              result
                .filter((r) => r.value.documentId !== publicId(docRef.current._id))
                .map((r) => typed<Option>({result: r, value: r.value.documentId})),
            )
          }
        })
        .catch((e) => {
          if (queryRef.current === queryString) {
            setSearching(false)
          }
          throw e
        })
    },
    [client, schemaType, indexConfig],
  )

  useEffect(() => {
    if (prevDebouncedQuery.current !== debouncedQuery) {
      runIndexQuery(debouncedQuery)
    }
    prevDebouncedQuery.current = debouncedQuery
  }, [debouncedQuery, runIndexQuery])

  const handleChange = useCallback(
    (nextId: string) => {
      if (!nextId) {
        onChange(unset())
        onPathFocus([])
        return
      }

      const patches = [
        setIfMissing({}),
        set(schemaType.name, ['_type']),
        set(publicId(nextId), ['_ref']),
        unset(['_weak']),
        unset(['_strengthenOnPublish']),
      ]

      onChange(patches)
      // Move focus away from _ref and one level up
      onPathFocus([])
    },
    [onChange, onPathFocus, schemaType.name],
  )

  const openButtonConfig: AutocompleteOpenButtonProps = useMemo(
    () => ({onClick: () => runIndexQuery(queryRef.current)}),
    [runIndexQuery, queryRef],
  )

  const handleQueryChange = useCallback(
    (newValue: string | null) => {
      const newQuery = newValue ?? ''
      queryRef.current = newQuery
      setQuery(newQuery)
    },
    [setQuery],
  )

  return (
    <Autocomplete
      id={id}
      ref={autocompleteRef}
      data-testid="semantic-autocomplete"
      placeholder="Type to search..."
      openButton={openButtonConfig}
      onFocus={handleFocus}
      onChange={handleChange}
      loading={searching}
      onBlur={handleBlur}
      readOnly={readOnly}
      filterOption={NO_FILTER}
      onQueryChange={handleQueryChange}
      options={options}
      renderOption={AutocompleteOption}
    />
  )
}

function AutocompleteOption(props: Option) {
  const value = props.result.value
  return (
    <Button mode="bleed" padding={1} style={{width: '100%'}}>
      <Flex gap={2} align="center">
        <Box flex={1}>
          <DocumentPreview documentId={value.documentId} schemaTypeName={value.type} />
        </Box>
        <Box padding={2}>
          <Text size={1} muted title={'Relevance'}>
            {Math.floor(props.result.score * 100)}%
          </Text>
        </Box>
      </Flex>
    </Button>
  )
}
