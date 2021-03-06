 
<p align="center">
  <img src="/public/hat2.png" width="120" /><h1  align="center"><code margin="0">magiql</code></h1><p align="center"><i>A bunch of simple but magical React hooks to work with GraphQL.<br>powered by <code><a href="https://github.com/tannerlinsley/react-query">react-query</a></code>, inspired by <code><a href="https://github.com/facebook/relay">relay</a></code> and <code><a href="https://github.com/FormidableLabs/urql">urql</a></code></i></p>
</p>

A set of React hooks to work with GraphQL data. `magiql` stands on the shoulders of massive giants in the data-synchronization and state-management space, both conceputally and some as actual dependencies. It uses the amazing [`react-query`](https://github.com/tannerlinsley/react-query) library as its data-fetching and synchronization layer which forms the foundation of this library. Seriously, without [`react-query`](https://github.com/tannerlinsley/react-query), this won't be any good. The API is also very similar to [`react-query`](https://github.com/tannerlinsley/react-query) and will be familiar to the users. It's just slightly tweaked to make it easier to work with GraphQL. On top of the these great synchronization primitives, we add normalized caching which allows us to enable the amazing developer experience that `relay` provides without any of the restrictions and buy-in required. 

`magiql` is designed to be easy to adopt (moving from vanilla `react-query` or other GraphQL clients). Most features (like normalized caching, `recoil`-based store implementation, `relay-compiler` and build-time optimizations) are completely optional and configurable. But everything is included under one installed dependency so that you don't have to install things again and again (don't worry, the different entry-points are code-split and you will only include things that you actually use). You can start using `magiql` as a GraphQL Client immediately and it grows to cater to your needs as they arise by allowing extensive customization and incrementally adoption of more speciliazed features.

# Features

Most of the features that we are providing are thanks to [`react-query`](https://github.com/tannerlinsley/react-query). Using inspiration from `relay` and `urql`, we are able to provide a bunch of additional awesome GraphQL-specific features that you can find below

* Auto Caching + Refetching (stale-while-revalidate, Window Refocus, Polling/Realtime)
* Parallel + Dependent Queries
* "Lazy" Queries
* Request Deduplication
* Paginated + Cursor-based Queries
* Load-More + Infinite Scroll Queries w/ Scroll Recovery
* Normalized caching + Entity Manipulation (multiple store implementations ([`recoil`](https://github.com/facebookexperimental/Recoil), [`react-query`](https://github.com/tannerlinsley/react-query))
* Fragment-first GraphQL approach (`relay`-style `useFragment` hook)
* Request Cancellation
* Mutations + Reactive Query Refetching
* Optimistic Updates
* Exchanges API to customize execution (logging, persisted queries, authentication, JWT token refresh)
* React Suspense Support (must be enabled with React Concurrent Mode)
* Dedicated Devtools

Using the [`relay-compiler`](https://github.com/facebook/relay) (via `magiql/babel` or `magiql` cli) is required to unlock some more awesome features,

* Schema-aware Normalized caching
* Typescript Support + Code generation
* Build-time GraphQL optimizations
* Skip parsing at runtime

**Note: You don't need a Relay-compliant server to get all these features in `magiql`. It will work with any GraphQL server. It also doesn't require you to commit to React Concurrent Mode which the new [`relay`](https://github.com/facebook/relay) hooks require.**

There is an example for this: [https://magiql.vercel.app](https://magiql.vercel.app). You can see the [components](/components) and [pages](/pages) folder for example code.

<img src='/public/example.gif' />

**Warning**: This is still in alpha stage and docs and examples are in the works

# Documentation

<details>
<summary><big><strong>Basic Usage</strong></big></summary>

```tsx
import {
  GraphQLClientProvider,
  GraphQLClient,
  useQuery,
  graphql,
} from "magiql";

const client = new GraphQLClient({
  endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index",
});

const People = () => {
  const { data, status, error } = useQuery(
    graphql`
      query PeopleQuery($limit: Int) {
        allPeople(first: $limit) {
          edges {
            node {
              id
              name
              homeworld {
                name
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        limit: 10,
      },
    }
  );

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div>
      {data
        ? data.allPeople?.edges?.map((edge) => (
            <div key={edge.node.id}>
              <b>{edge.node.name}</b> ({edge.node.homeworld?.name})
            </div>
          ))
        : null}
    </div>
  );
};

const App = () => {
  return (
    <GraphQLClientProvider client={client}>
      <People />
    </GraphQLClientProvider>
  );
};
```

</details>

<details>
<summary><big><strong>Installation</strong></big></summary>
 
To install `magiql` with all its features to your project, run the following commands based on if you use `yarn` or `npm`. The single dependency includes multiple entry points to code-split features and not require user to install more dependencies.

```sh
yarn add magiql graphql

# or
npm install magiql graphql --save
```

</details>

<details>
<summary><big><strong>Using the Relay compiler</strong></big></summary>

_This is required to use fragments and normalized caching_

To use the [`relay-compiler`](https://github.com/facebook/relay), add `magiql/babel` to your Babel config as a plugin, eg. in `babel.config.js`. The `magiql` Babel plugin is just a wrapper around [`babel-plugin-relay`](https://github.com/facebook/relay) to include everything in one dependency. It also runs the [`relay-compiler`](https://github.com/facebook/relay) in watch mode by default.

```javascript
module.exports {
  presets: [ ... ],
  plugins: ["magiql/babel", ... ]
}
```

Or, you can run the compiler from cli using the `magiql` command (use `magiql --watch` for watch mode, recommended for development). This is also just a wrapper around the [`relay-compiler`](https://github.com/facebook/relay). You still need to add the Babel plugin, but can disable running the compiler with Babel, but setting `runWithBabel` to `false` in `magiql.config.js`.

#### `magiql.config.js`

If need to customize the Relay compiler away from the defaults (specified below), add a `magiql.config.js` file in the root directory. It is very similar to `relay.config.js`, but tailored a little for `magiql`.

```javascript
module.exports = {
  schema: "./schema.graphql",
  src: "./",
  artifactDirectory: "generated",
  extensions: ["ts", "tsx", "js", "jsx", "graphql"],
  quiet: false,
  watch: boolean,
  runWithBabel: true,
  language: "typescript",
  include: ["**"],
  exclude: [
      "**/node_modules/**",
      "**/__mocks__/**",
      `**/generated/**`,
    ];
 }

```

</details>

<details>
<summary><big><strong>Working with fragments</strong></big></summary>

With GraphQL, the biggest game changer when used with React are **fragments**. The `useFragment` hook introduced by [`relay`](https://github.com/facebook/relay) makes it delightful to declare the data needs of your components. These are some of the advantages:

- Date requirements completely localized and encapsulated in your component
- Declarative, modular and composable
- Fragments can include nest more fragments and fits naturally with the React component model
- Don't need to add everything to the top level query
- Easy to ensure type safety (using [`relay-compiler`](https://github.com/facebook/relay) generated files)
- Data available independent of how the data is fetched by some parent component
- Components only subscribe to the precise part of the data store that it cares about (down to the field level).

#### Usage (with fragments)

```tsx
// Person.tsx
import React from "react";
import { useFragment, graphql } from "magiql";
import { Person_person } from "generated/Person_person.graphql";

export function Person({ person }: { person: Person_person }) {
  const data = useFragment(
    graphql`
      fragment Person_person on Person {
        name
        homeworld {
          name
        }
      }
    `,
    person
  );

  return (
    <div>
      <b>{data.name}</b> ({data.homeworld?.name})
    </div>
  );
}
```

```tsx
// People.tsx
import React from "react";
import { useQuery, graphql } from "magiql";
import { PeopleQuery } from "generated/PeopleQuery.graphql";
import { Person } from "./Person";

export const People = () => {
  const { data, status, error } = useQuery<PeopleQuery>(
    graphql`
      query PeopleQuery($limit: Int) {
        allPeople(first: $limit) {
          edges {
            node {
              id
              ...Person_person
            }
          }
        }
      }
    `,
    {
      variables: {
        limit: 10,
      },
    }
  );

  return (
    <div>
      {data
        ? data.allPeople?.edges?.map((edge) => <Person person={edge.node} />)
        : null}
    </div>
  );
};
```

```tsx
import { GraphQLClientProvider, GraphQLClient } from "magiql";
import { createRecoilStore } from "magiql/recoil-store";
import { People } from "./People";

const client = new GraphQLClient({
  endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index",
  useStore: createRecoilStore(),
});

const App = () => {
  return (
    <GraphQLClientProvider client={client}>
      <People />
    </GraphQLClientProvider>
  );
};
```

These features and accompanying restrictions provide an excellent authoring experience that almost seems magical when it works.

</details>

<details>
<summary><big><strong>Typescript Support</strong></big></summary>
 
Using the Relay compiler, `magiql` can generate types for all your operations since it has access to your schema as well. These types are generated and updated by the compiler, so ensure that it's running in watch mode (either through Babel or the cli) when you are developing.
  
If the name of query is `HomeQuery`, then import type as such:

```typescript
import { HomeQuery } from "generated/HomeQuery.graphql";
import { useQuery } from "magiql";

const { data, error } = useQuery<HomeQuery>(graphql`
  query HomeQuery {
    currentHome {
      name
    }
  }
`);
```

- Types are imported from the folder specified as `artifactDirectory` in `magiql.config.js` (Default: `generated`).
- Typescript support is enabled by default. To disable it, set `language` to `javascript` in `magiql.config.js`.
- If not using the compiler, you can provide type parameters to each operation with the following sample signature

```tsx
type HomeQuery = {
  response: {
    currentHome: {
      name: string;
    };
  };
  variables: {};
};
```

</details>

<details>
<summary><big><strong>Customizing the GraphQL Client</strong></big></summary>

Coming soon

</details>

<details>
<summary><big><strong>Exchanges</strong></big></summary>

Coming soon

</details>

<details>
<summary><big><strong>Normalized caching</strong></big></summary>

To fully unlock fragments, including optimistic responses and cache manipulation of entities, we needed a normalized cache of our data. We call this cache, the **`store`** in `magiql`.

- Each entity is identified and stored once.
- Component that access entities subscribe to changes to that entity
- Implementation can be customized when creating a `GraphQLClient` via the `useStore` option, we provide three implementations of our own (using [`recoil`](https://github.com/facebookexperimental/Recoil) and [`react-query`](https://github.com/tannerlinsley/react-query)'s `QueryCache`)
- Provide your own `getDataID` to these stores to control how id's are determined and then let `magiql` handle the rest for managing access.

```typescript
import { GraphQLClient } from "magiql";
import { createRecoilStore } from "magiql/recoil-store";

const client = new GraphQLClient({
  endpoint: "...",
  useStore: createRecoilStore({
    // optional, by default it uses the `id` field if available otherwise falls back to an unnormalized id
    // this is the default function
    getDataID: (record, type) => (record.id ? `${type}:${record.id}` : null),
  }),
});
```

#### Store Implementations

- Recoil `createRecoilStore`
  - **Recommended** if already working with the compiler and the Babel plugin
  - Each field of an entity is stored as atom, entities and fragments are both selectors on the atoms
  - Components subscribe to fields on entities (very granular and precise)
  - Customize how to determine `id` for each entity
- React Query's `QueryCache` as store `createNormalizedQueryCacheStore`
  - Each entity is a query with the entity's id as the key
  - Components subscribe to entities (not field-level subscriptions)
  - Same API as `createRecoilStore`
- React Query's QueryCache (unnormalized) `createQueryCacheStore`
  - Client's QueryCache stores data attached to queries, and doesnt identify entities
  - Doesn't allow cache manipulation with entities
  - No options required since doesn't actually normally, but will still work with Fragments

</details>

<details>
<summary><big><strong>Naming convention for operations</strong></big></summary>
  
Relay allows us to use fragments in queries and mutations without importing them as modules. For this to work, the names must be globally unique. It is also good habit to name the fragments and queries based on the components and props that use them. Thus, relay enforces a few conventions when it comes to naming your operations. These conventions are quite helpful and make your lives easier:
  
 
* Queries must be named `query ${ModuleName}Query { ... }`, eg, a query in file `Home.tsx` can be named `HomeQuery` or `HomeRoomsQuery`
* Mutations must be named `mutation ${ModuleName}Mutation { ... }`, eg, a mutation in file `Home.tsx` can be named `HomeMutation` or `HomeDestroyMutation`
* Fragments must be named `fragment ${ModuleName}_${propName} on type { ... }`, eg, a fragment in file `HomeDetails.tsx` where the prop for the fragment ref is `home` can be named `HomeDetails_home`
  
</details>

<details>
<summary><big><strong>Devtools</strong></big></summary>
 
You can use the `magiql` Devtools which are inspired by `react-query-devtools` as follows:

```tsx
import React from "react";
import { GraphQLClient, GraphQLClientProvider } from "magiql";
import GraphQLDevtools from "magiql/devtools";

export default function App({ children }) {
  return (
    <GraphQLClientProvider client={client}>
      {children}
      <GraphQLDevtools defaultIsOpen defaultTab="store" />
    </GraphQLClientProvider>
  );
}
```

</details>

# API

The following is the core API for `magiql`. With the help of amazing libraries like [`react-query`](https://github.com/tannerlinsley/react-query), [`relay-compiler`](https://github.com/facebook/relay) and [`recoil`](https://github.com/facebookexperimental/Recoil), we are able to provide the following features as a GraphQL client. The runtime is your familiar [`react-query`](https://github.com/tannerlinsley/react-query) api. There is also an optional build time setup that unlocks fragments and normalized store.

<details>
<summary><big><code>useQuery</code></big></summary>
 
You can use the `magiql` Devtools which are inspired by `react-query-devtools` as follows:

```tsx
import React from "react";
import { GraphQLClient, GraphQLClientProvider } from "magiql";
import GraphQLDevtools from "magiql/devtools";

export default function App({ children }) {
  return (
    <GraphQLClientProvider client={client}>
      {children}
      <GraphQLDevtools defaultIsOpen defaultTab="store" />
    </GraphQLClientProvider>
  );
}
```

</details>

### Runtime

- `useQuery(query, { variables, ...options })`, `usePaginatedQuery` and `useInfiniteQuery`: Data fetching patterns for GraphQL queries with numerous ways to customize them for refetching on different events
  - All `options` from [`react-query`](https://github.com/tannerlinsley/react-query) are valid in the second argument
  - No fetch function or query key required
  - Stale-while-revalidate caching strategy
  - Request deduplication
  - Infinite queries
  - Paginated queries
  - Parallel and dependent queries
  - Lazy queries
  - Window Focus refetching
  - Network Status refetching
  - Polling/interval refetching
  - Normalized caching (uses [`relay-compiler`](https://github.com/facebook/relay))
- `useMutation`: a hook that provides a way to run GraphQL mutations (updates) on the server state conviniently with optmistic updates from your React app
  - Optimistic updates
  - Cache manipulation for entities in store
- `useFragment`: a hook that allows you to properly encapsulate the date requirements of a component within it by subscribing to a GraphQL Fragment which resolves when provided a ref from the parent component via props
  - Field-level subscription for fragments, only rerenders when that changes
  - Allows nesting of fragments, great deal of composability and reusability
  - Doesn't need to be responsible for fetching data (gets reference from parent component)
  - **Requires that you run the [`relay-compiler`](https://github.com/facebook/relay) with either the Babel plugin or the cli command.**
- `useGraphQLClient`: Access the underlying GraphQLClient
  - Create new client using `GraphQLClient` class
  - Add the `GraphQLClientProvider` with an instance of a `GraphQLClient`
  - Can customize [`react-query`](https://github.com/tannerlinsley/react-query) config by using `new GraphQLClient({ endpoint: "...", queryConfig: {...} })
- Exchanges based API for customizing query execution behaviour, allows for,
  - logging, authentication, refreshing tokens, normalization, error handling
- React Suspense support
  - prowered by [`react-query`](https://github.com/tannerlinsley/react-query) (must be enabled)
- React Native support
  - Should work out of the box in `expo` or wherever the `react-native` `package.json` property is resolved

## Foundation and inspirations

Here are some of the big dependencies and inspirations for `magiql`:

- [react-query](https://github.com/tannerlinsley/react-query)

  - Data-fetching (network) layer
  - Stale-while-revalidate caching strategy
  - Request deduplication
  - Window Focus refetching
  - Network Status refetching
  - Infinite queries
  - Paginated queries
  - Parallel and dependent queries
  - Lazy queries
  - Polling/interval refetching
  - React Suspense support
  - Normalized caching (with the help of the relay compiler)
  - Differences:
    - No query key required (GraphQL document name + variables form the key)
    - No query fetch function required (provided by the client with customization options)
    - Pass GraphQL document as first argument

- [relay-compiler](https://github.com/facebook/relay)
  - Build time optimizations (flatten fragments, add id fields, etc.)
  - Code-generation for types (for full typescript support)
  - Using fragments effectively with optimizations
  - Concept: `useFragment` hook (game changer!) to declaratively define data needs for components independent of the fetching of the data
  - Implementation: `relay-runtime` inspiration for (de)normalizating data
  - `magiql` allows us to use the [`relay`](https://github.com/facebook/relay) hooks API without jumping to React Suspense (can't use the new relay hooks without that)
  - **Do not need relay compliant server (will work with any GraphQL server)**
- [recoil](https://github.com/facebookexperimental/Recoil) (opt-in)
  - Alternative implementation for normalized cache for data
  - Granular subscription (field-level) to data for fragments and queries based on exactly what they ask
  - _similar implementation for jotai is also being worked on_
- [urql](https://github.com/FormidableLabs/urql) (inspiration)
  - Concept: `exchange` API to customize execution of graphql request
  - Allowed easy ways to add logging, persisted queries, auth (with token refresh support)
