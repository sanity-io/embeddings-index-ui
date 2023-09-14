# @sanity/embeddings-index-ui

> This package contains plugins for **Sanity Studio v3**.

Sanity Studio plugins that interact with the `/embeddings-index` HTTP API.

The embeddings index API allows the creation of named embeddings vector indexes.
An embeddings index contains embeddings for all Sanity documents matching a configured [GROQ filter](https://www.sanity.io/docs/how-queries-work) in a dataset.
A [GROQ projection](https://www.sanity.io/docs/query-cheat-sheet) is applied to matching documents before vectorization.

You can query indexes using semantic text search to obtain a list of matching document IDs sorted by relevance.

When an index is first created, all documents matching the configured filter are synced into the index.
Creating an index can take time, depending on the number of existing documents and the indexer load.

For a CLI alternative, check out the [Embeddings Index CLI](https://github.com/sanity-io/embeddings-index-cli) package.

## Installation

```sh
npm install @sanity/embeddings-index-ui
```

`@sanity/embeddings-index-ui` contains the following Sanity Studio plugins: 

* [embeddingsIndexReferenceInput](#embeddings-index-reference-input): semantic search mode for reference inputs
* [embeddingsIndexDashboard](#embeddings-index-dashboard): manage indexes in a Sanity Studio UI tool

For more information about how to use the plugins, see the relevant sections below.

## Embeddings index reference input

<img width="619" alt="image" src="https://github.com/sanity-io/sanity/assets/835514/55d372fe-c5fe-40dd-882b-10c6e8794442">

The `embeddingsIndexReferenceInput` plugin allows reference fields to opt in to embeddings index search.
This enables users to search for references using natural language, and to retrieve documents based on semantic meaning,
rather than exact word matches.

### Usage

Add `embeddingsIndexReferenceInput` as a plugin to `sanity.config.ts` (or `.js`):

```ts
import {defineConfig} from 'sanity'
import {embeddingsIndexReferenceInput} from '@sanity/embeddings-index-ui'

export default defineConfig({
  //...
  plugins: [embeddingsIndexReferenceInput()],
})
```

Then, enable semantic search using `options.embeddingsIndex` on reference fields:

```ts
defineField({
  name: 'myField',
  type: 'reference',
  to: [{type: 'myType'}], // The type(s) of document(s) to include
  options: {
    embeddingsIndex: {
      indexName: 'my-index', // Name of the embeddings index
      maxResults: 10, // Max. number of returned results per request. Default: 10
      searchMode: 'embeddings' // 'embeddings': implement semantic search | 'default': use default search based on GROQ filter
    }
  }
})
```

Setting `options.embeddings.indexName` on a reference field enables searching into the named index.
When enabled, this option adds a _search mode_ toggle button for the field in the UI.

*Note*: the search uses `to` types as a filter for the index. Therefore, the types that the
the reference field expects must exist in the index: the GROQ query specified in the embeddings index
`filter` must include one or more documents that are relevant to the reference field.

*Caveats*: the semantic search functionality does not honor `options.filter`.

## Embeddings index dashboard

A UI alternative to the [Embeddings ˆndex CLI](https://github.com/sanity-io/embeddings-index-cli) to
manage embeddings indexes in a Studio dashboard.

<img width="1227" alt="image" src="https://github.com/sanity-io/sanity/assets/835514/279b03b8-d2c0-4cc1-bbe6-9d335937f25a">

### Usage

Add `embeddingsIndexDashboard` as a plugin to `sanity.config.ts` (or `.js`):

```ts
import {defineConfig} from 'sanity'
import {embeddingsIndexDashboard} from '@sanity/embeddings-index-ui'

export default defineConfig({
  //...
  plugins: [    
    process.env.NODE_ENV === 'development'
    ? embeddingsIndexDashboard()
    : {name: 'embeddings-index-dashboard-disabled'}
  ],
})
```

This adds the Embeddings Index tool to the studio navigation bar, but only when the studio is running in developer mode (`localhost).

If you want to enable the tool based on user access roles:

```ts
import {defineConfig} from 'sanity'
import {embeddingsIndexDashboard} from '@sanity/embeddings-index-ui'

export default defineConfig({
  //...
  plugins: [embeddingsIndexDashboard()],

  tools: (prev, context) => {
    const enabledForRoles = ['developer']
    const canManageEmbeddingsIndex = context.currentUser?.roles
      .map((role) => role.name)
      .some((roleName) => enabledForRoles.includes(roleName))
    return canManageEmbeddingsIndex ? prev : prev.filter((tool) => tool.name !== 'embeddings-index')
  },
})
```

## License

[MIT](LICENSE) © Sanity

## Develop and test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build and watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hot reload in the studio.


### Release new version

Run ["CI & Release" workflow](https://github.com/sanity-io/embeddings-plugin/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.
