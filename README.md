# 🧙 magiql

A simple but potentially magical GraphQL client for React. It stands on the shoulders of massive giants in the data-synchronization and state-management tools in this space both conceputally and some as actual dependencies. It uses the amazing React Query library as its data fetching (network) layer to synchronize data with your backend. The API is also very similar to `react-query` just slightly tweaked to make it easier with GraphQL. The data fetching patterns with `useQuery`, `usePaginatedQuery` and `useInfiniteQuery` (and the numerous ways to customize them) cover almost all use cases that ever arise. They provide an amazing user experience with regards to the freshness of the data without overfetching. The `useMutation` hook provides a way to update the server state from your React app. And last, the `useFragment` hook allow you to properly encapsulate the date requirements of a component within it (for maximum composability and reusability)

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
  endpoint: "https://graphql-pokemon.now.sh"
});

const SearchPokemon = () => {
  const { data, status, error } = useQuery(graphql`
    query pokemon($name: String) {
      pokemon(name: $name) {
        id
        number
        name
        attacks {
          special {
            name
            type
            damage
          }
        }

        image
      }
    }
  `, {
    variables: {
      name: "pikachu",
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

With GraphQL, the biggest game changer when used with React are __fragments__. The `useFragment` hook introduced by `relay` makes it delightful to declare the data needs of your components, completely localized in your component, independent of how the data is fetched by some parent component. A component only subscribes to the part of the data store that it cares about (down to the field level). These restrictions provide an excellent authoring experience that almost seems magical when it works. This makes components that much more composable and reusable. It is also fully typed thanks to the Relay compiler. 

To fully unlock fragments, including optimistic responses and cache manipulatioon, we needed a normalized cache (store) of our data where each entity is identified and stored once. In this case, every component that accesses that data subscribes to the single entity and rerenders when the entity changes. The normalized cache is **optional** and you can begin to use `magiql` and fragments without it too. In `magiql`, we have provided a few implementations of the `store` that all allow fragments to be used:

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

