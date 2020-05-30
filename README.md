# 🧙 magiql

A simple but potentially magical GraphQL client for React backed by [react-query](https://github.com/tannerlinsley/react-query).
The API is very similar to Apollo Client. The cache is managed by react-query and a very thin fetch wrapper is used
to make the requests. A simple middleware API is used to allow for things like auth.

Usage example:

```tsx
import {
  MagiqlProvider,
  createClient,
  useQuery,

  // no cost function, just returns the string, 
  // but allows IDE's to recognize the string as GraphQL tag.
  gql,
} from "magiql";

const client = createClient("https://graphql-pokemon.now.sh");

const SearchPokemon = () => {
  const { data, status, error } = useQuery(gql`
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
    <MagiqlProvider client={client}>
      <SearchPokemon />
    </MagiqlProvider>
  );
}

```

We can use middleware to customize options passed down to the fetch function. This allows adding functionality for things like auth.

```javascript
import { parseCookies } from "nookies";
import { createClient } from "magiql";

const getCookieToken = () => {
  return parseCookies().token;
};

export const authMiddleware = (getToken: () => string) => (fetch) => {
  return (url, operation, vars, options = {} as any) => {
    const token = getToken();
    options.headers = {
      ...options.headers,
      authorization: token ? `Bearer ${token}` : "",
    };
    const a = fetch(url, operation, vars, options);
    return a;
  };
};

const client = createClient("https://graphql-pokemon.now.sh", {}, [authMiddleware(getCookieToken)]);

```

## Magic

Inspired by [babel-blade](https://github.com/babel-blade/babel-blade), an experimental API to infer
the GraphQL query from usage within the components.

With babel config (example with Next.js):

```json
{
  "presets": ["next/babel"],
  "plugins": ["magiql/babel"]
}
```

Code example:

```tsx
import { useMagiqlQuery } from "magiql";

const MagicalPokemonSearch = () => {
  const { query, loading, error } = useMagiqlQuery("searchPokemon");
  
  if (loading) {
    return <div>loading...</div>;
  }

  const pokemons = query.pokemons({
      first: 10,
    })
    ?.map((pokemon) => ({ image: pokemon?.image, id: pokemon?.id, name: pokemon?.name }));

  return (
    <pre>
      {JSON.stringify({ loading, data: query, error, pokemons }, null, 2)}
    </pre>
  );
};
```

```graphql
# Query generated by magiql at build-time:

`query searchPokemon {
  pokemons_35d4: pokemons(first: 10) {
    image
    id
    name
  }
}`
```

## Code generation

Uses [graphql-code-generator](https://github.com/dotansimha/graphql-code-generator) to generate hooks from graphql documents
across your project. Uses [graphql-config](https://github.com/kamilkisiela/graphql-config) spec to get the necessary config.
Converts magiql into a smart module that supplies necessary hooks with full type-safety during the developent. Just need to run `magiql` command on the CLI to generate types. `magiql --watch` runs it in watch mode.

```yaml
# .graphqlconfig.yml

schema: https://graphql-pokemon.now.sh
documents: pages/**/*.{tsx,ts,graphql}
```

```graphql
# pokemon.graphql
query searchPokemon($name: String) {
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
`;
```

```tsx
import { useSearchPokemonQuery } from "magiql";

const SearchPokemon = () => {
  const { data, status, error } = useSearchPokemonQuery({
    variables: {
      name: "pikachu",
    },
  });

  return <pre>{JSON.stringify({ status, data, error }, null, 2)}</pre>;
};
```

Using code generation, we can get autocompletion for types while working with `useMagiqlQuery`.

<img src="https://github.com/nksaraf/magiql/blob/master/examples/example.png" data-canonical-src="https://github.com/nksaraf/magiql/blob/master/examples/example.png" width="400" alt="Typescript autocomplete useMagiqlQuery" />

