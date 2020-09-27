# 🧙 magiql

A set of React hooks to work with GraphQL data. `magiql` stands on the shoulders of massive giants in the data-synchronization and state-management space, both conceputally and some as actual dependencies. It uses the amazing `react-query` library as its data-fetching and synchronization layer which forms the foundation of this library. Seriously, without `react-query`, this won't be any  good. The API is also very similar to `react-query` and will be familiar to the users. It's just slightly tweaked to make it easier to work with GraphQL. 

There is an example for this: [https://magiql.vercel.app](https://magiql.vercel.app)

The following is the core API for `magiql`. With the help of amazing libraries like `react-query`, `relay-compiler` and `recoil`, we are able to provide the following features as a GraphQL client:

* `useQuery(query, { variables, ...options })`, `usePaginatedQuery` and `useInfiniteQuery`: Data fetching patterns for GraphQL queries with numerous ways to customize them for refetching on different events
   * All `options` from `react-query` are valid in the second argument
   * No fetch function or query key required
   * Stale-while-revalidate caching strategy
   * Request deduplication
   * Infinite queries
   * Paginated queries
   * Parallel and dependent queries
   * Lazy queries
   * Window Focus refetching
   * Network Status refetching
   * Polling/interval refetching
   * Normalized caching (uses `relay-compiler`)
* `useMutation`: a hook that provides a way to run GraphQL mutations (updates) on the server state conviniently with optmistic updates from your React app
   * Optimistic updates
   * Cache manipulation for entities in store
* `useFragment`: a hook that allows you to properly encapsulate the date requirements of a component within it by subscribing to a GraphQL Fragment which resolves when provided a ref from the parent component via props  
   * Field-level subscription for fragments, only rerenders when that changes
   * Allows nesting of fragments, great deal of composability and reusability
   * Doesn't need to be responsible for fetching data (gets reference from parent component)
* `useGraphQLClient`
* React Suspense support
  * prowered by `react-query`
* Conventions for naming operations (should follow is using compiler)
  * Queries must be named `query ${ModuleName}Query {}`, eg, a query in file `Home.tsx` can be named `HomeQuery` or `HomeRoomsQuery`
  * Mutations must be named `mutation ${ModuleName}Mutation {}`, eg, a mutation in file `Home.tsx` can be named `HomeMutation` or `HomeDestroyMutation`
  * Fragments must be named `fragment ${ModuleName}_${propName} on type {}`, eg, a fragment in file `HomeDetails.tsx` where the prop for the fragment ref is `home` can be named `HomeDetails_home`
  * Relay allows us to use fragments in queries and mutations without importing them as modules. For this to work, the names must be globally unique. It is also good habit to name the fragments based on the components and props that use them.
* `magiql/babel`: The `magiql` Babel plugin is just a wrapper around `babel-plugin-relay` to include everything in one dependency.
   * _Necessary to work with `useFragment` hook and the the normalized store._
   * Runs the `relay-compiler` when the babel plugin is loaded. If you don't want this, set `runWithBabel` to `false` in the `magiql.config.js` file.
* `magiql` cli command
   * runs `relay-compiler` with config from `magiql.config.js`.
* Typescript support
   * Types automatically generated by `relay-compiler` (run with Babel or via cli command `magiql`)
   * Can be imported from the folder specified as `artifactDirectory` in `magiql.config.js` (Default: `generated`). 
   * If the name of query is `HomeQuery`, then import type as such:
     ```
     import { HomeQuery } from "generated/HomeQuery.graphql";
     import { useQuery } from "magiql";
     
     const { data, error } = useQuery<HomeQuery>(graphql`
      query HomeQuery {
        currentHome {
          name
        }
      }`
     )
     ```
   * Enabled by default
   * To disable, set `language` to `javascript` in `magiql.config.js`
* React Native support
   * Should work out of the box in `expo` or wherever the `react-native` `package.json` property is resolved
* `magiql/devtools`:  Devtools for queries (with the help of `react-query-devtools`) and normalized store
   * use `GraphQLDevtools` from in your component tree somewhere inside the `GraphQLClientProvider`

**Warning**: This is still in alpha stage and there are basically no docs available

## Installation

To install `magiql` to your project, run the following commands based on if you use `yarn` or `npm`
```sh
yarn add magiql

# or
npm install magiql --save
```

## Foundation and inspirations
Here are some of the big dependencies and inspirations for `magiql`:

* React Query
  * Data-fetching (network) layer
  * Stale-while-revalidate caching strategy
  * Request deduplication
  * Window Focus refetching
  * Network Status refetching
  * Infinite queries
  * Paginated queries
  * Parallel and dependent queries
  * Lazy queries
  * Polling/interval refetching
  * React Suspense support
  * Normalized caching (with the help of the relay compiler)
  * Differences:
     * No query key required (GraphQL document name + variables form the key)
     * No query fetch function required (provided by the client with customization options)
     * Pass GraphQL document as first argument
 
* Relay Compiler
  * Build time optimizations (flatten fragments, add id fields, etc.)
  * Code-generation for types (for full typescript support)
  * Using fragments effectively with optimizations
  * Concept: `useFragment` hook (game changer!) to declaratively define data needs for components independent of the fetching of the data
  * Implementation: `relay-runtime` inspiration for (de)normalizating data
  * `magiql` allows us to use the `relay` hooks API without jumping to React Suspense (can't use the new relay hooks without that)
  * **Do not need relay compliant server (will work with any GraphQL server)**
  
  
* Recoil (opt-in)
  * Alternative implementation for normalized cache for data
  * Granular subscription (field-level) to data for fragments and queries based on exactly what they ask
  * _similar implementation for jotai is also being worked on_
  
* Urql (inspiration)
  * Concept: `exchange` API to customize execution of graphql request
  * Allowed easy ways to add logging, persisted queries, auth (with token refresh support)

## Basic usage

```tsx
import {
  GraphQLClientProvider,
  GraphQLClient,
  useQuery,
  graphql,
} from "magiql";

const client = new GraphQLClient({
  endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index"
});

const SearchPokemon = () => {
  const { data, status, error } = useQuery(graphql`
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
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
  `, {
    variables: {
      limit: 10,
    },
  });

  return <pre>{JSON.stringify({ status, data, error }, null, 2)}</pre>;
};

const App = () => {
  return (
    <GraphQLClientProvider client={client}>
      <SearchPokemon />
    </GraphQLClientProvider>
  );
}

```

## Working with fragments

With GraphQL, the biggest game changer when used with React are __fragments__. The `useFragment` hook introduced by `relay` makes it delightful to declare the data needs of your components.

* Date requirements completely localized and encapsulated in your component
* Declarative, modular and composable
* Fragments can include nest more fragments and fits naturally with the React component model
* Don't need to add everything to the top level query
* Easy to ensure type safety (using `relay` compiler artifacts)
* Data available independent of how the data is fetched by some parent component
* Components only subscribe to the precise part of the data store that it cares about (down to the field level). 

These features and accompanying restrictions provide an excellent authoring experience that almost seems magical when it works. To fully unlock fragments, including optimistic responses and cache manipulation of entities, we needed a normalized cache (store) of our data where each entity is identified and stored once. In this case, every component that accesses that data subscribes to the single entity and rerenders when the entity changes. The normalized cache is **optional** and you can begin to use `magiql` and fragments without it too. In `magiql`, we have provided a few implementations of the `store` that all allow fragments to be used:

* Recoil `createRecoilStore`
   * Each field of an entity is stored as atom, entities and fragments are both selectors on the atoms
   * Components subscribe to fields on entities (very granular and precise)
   
* React Query's QueryCache as store `createNormalizedQueryCacheStore`
   * Each entity is a query with the entity's id as the key
   * Components subscribe to entities (not field-level subscriptions)
   
* React Query's QueryCache (unnormalized) `createQueryCacheStore`
   * Client's QueryCache stores data attached to queries, and doesnt identify entities
   * Doesn't allow cache manipulation with entities
   
* Jotai `createJotaiStore`
  * _Coming soon_
  * Similar to recoil's store

