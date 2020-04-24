# MagiQL

A simple but potentially magical GraphQL client for React backed by [react-query](https://github.com/tannerlinsley/react-query).
The API is very similar to Apollo Client. The cache is managed by react-query and a very thin fetch wrapper is used
to make the requests. A simple middleware API is used to allow for things like auth.

Usage example:

```javascript
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

```javascript
import {
  MagiqlProvider,
  createClient,
  useMagiqlQuery
} from "magiql";

const client = createClient("https://graphql-pokemon.now.sh");

// Query generated:
`query searchPokemon {
  pokemons_35d4: pokemons(first: 10) {
    image
    id
    name
  }
}`

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

const App = () => {
  return (
    <MagiqlProvider client={client}>
      <MagicalPokemonSearch />
    </MagiqlProvider>
  );
}
```

Using code generation, we can get autocompletion for types while working with `useMagiqlQuery`.

![Typescript auto-complete example](https://github.com/nksaraf/magiql/blob/master/examples/example.png)

