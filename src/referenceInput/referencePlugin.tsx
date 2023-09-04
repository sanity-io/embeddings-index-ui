import {definePlugin, isObjectInputProps, ObjectInputProps, ReferenceSchemaType} from 'sanity'
import {SemanticSearchReferenceInput} from './SemanticSearchReferenceInput'
import {isType} from '../utils/types'

export const embeddingsIndexReferenceInput = definePlugin({
  name: '@sanity/embeddings-index-reference-input',
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
