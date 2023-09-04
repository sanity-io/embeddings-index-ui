# @sanity/embeddings-index-ui
> This package contains plugins for **Sanity Studio v3**.

`@sanity/embeddings-index-ui` Sanity Studio plugins that interacts with the `/embeddings-index` HTTP API.

The embeddings index API allows the creation of named embeddings vector indexes.
An embeddings index contains embeddings for all Sanity documents matching a configured GROQ filter in a dataset.
A GROQ projection is applied to matching documents before vectorization.

Indexes can be queried using semantic text search, and returns a list of matching document ids,
sorted by relevance.

When an index is first created, all documents matching the configured filter will be synced into the index.
This can take some time depending on the number of documents that need to be synced.

For a CLI alternative, check out the [Embeddings index CLI](https://github.com/sanity-io/embeddings-index-cli) package.

## Installation

```sh
npm install @sanity/embeddings-index-ui
```

`@sanity/embeddings-index-ui` contains the following Sanity Studio plugins: 

* [embeddingsIndexReferenceInput](#embeddings-index-reference-input): semantic search mode for reference inputs
* [embeddingsIndexDashboard](#embeddings-index-dashboard): manage indexes in a Sanity studio tool

Consult each section for usage details.

## Embeddings index reference input

<img width="619" alt="image" src="https://github.com/sanity-io/sanity/assets/835514/55d372fe-c5fe-40dd-882b-10c6e8794442">

The `embeddingsIndexReferenceInput` plugin allows references fields to opt-in to embeddings index search.
This users to search for references using natural language to find documents based on semantic meaning,
bypassing the need for exact word matches.

### Usage

Add `embeddingsIndexReferenceInput` as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from 'sanity'
import {embeddingsIndexReferenceInput} from '@sanity/embeddings-index-ui'

export default defineConfig({
  //...
  plugins: [embeddingsIndexReferenceInput()],
})
```

Next, enabled semantic search using `options.embeddingsIndex` on reference fields:

```ts
defineField({
  name: 'myField',
  type: 'reference',
  to: [{type: 'myType'}],
  options: {
    embeddingsIndex: {
      indexName: 'my-index',
      maxResults: 10, // default,
      searchMode: 'embeddings' // defaults value is 'default'
    }
  }
})
```

Setting `options.embeddings.indexName` on a reference field will allow enabled searching into the named index.

This will add a "search mode" toggle button to the field.

*Note*: The search will use `to` types as a filter into the index, so it important
that the types the reference field expects actually exist in the index 
(ie, the embeddings index `filter` contains one or more documents relevant to the reference field).

*Caveats*:
`options.filter` is not respected by the semantic search.

## Embeddings index dashboard
An UI alternative to the [Embeddings index CLI](https://github.com/sanity-io/embeddings-index-cli)
Manage embeddings indexes in a Studio dashboard.

<img width="1227" alt="image" src="https://github.com/sanity-io/sanity/assets/835514/279b03b8-d2c0-4cc1-bbe6-9d335937f25a">


## Usage

Add `embeddingsIndexDashboard` as a plugin in `sanity.config.ts` (or .js):

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

This will add the Embeddings tool to the studio nav-bar, only when studio is running in developer mode (localhost).

You might instead want to enable this tool based on roles instead:

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

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.


### Release new version

Run ["CI & Release" workflow](https://github.com/sanity-io/embeddings-plugin/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.
