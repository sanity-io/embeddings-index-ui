import 'sanity'
/* eslint-disable no-unused-vars */
declare module 'sanity' {
  interface ReferenceBaseOptions {
    embeddingsIndex?: {
      /**
       * Name of the index
       */
      indexName: string
      maxResults?: number
      /**
       * Determines if which search mode is enabled by default for the reference field.
       * Default is the studio default search, while 'embeddings' enables
       * Defaults to 'default' behaviour
       */
      searchMode?: 'embeddings' | 'default'
    }
  }
}
