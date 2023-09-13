import {definePlugin, isObjectInputProps, ObjectInputProps, ReferenceSchemaType} from 'sanity'
import {SemanticSearchReferenceInput} from './SemanticSearchReferenceInput'
import {isType} from '../utils/types'
import {FeatureEnabledProvider} from '../api/isEnabled'

export const embeddingsIndexReferenceInput = definePlugin({
  name: '@sanity/embeddings-index-reference-input',
  studio: {
    components: {
      layout: (props) => {
        return <FeatureEnabledProvider>{props.renderDefault(props)}</FeatureEnabledProvider>
      },
    },
  },
  form: {
    components: {
      input: (props) => {
        if (
          isObjectInputProps(props) &&
          isType(props.schemaType, 'reference') &&
          (props.schemaType as ReferenceSchemaType).options?.embeddingsIndex?.indexName
        ) {
          return <SemanticSearchReferenceInput {...(props as ObjectInputProps)} />
        }
        return props.renderDefault(props)
      },
    },
  },
})
