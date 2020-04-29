import {
  MagiqlProvider,
  createClient,
  useQuery,
  gql,
  usePokemonQuery,
  useMagiqlQuery,
  useFragment,
  Pokemon,
} from "magiql";
import dynamic from "next/dynamic";
import React from "react";

let ReactQueryDevtools: any = undefined;

if (process.env.NODE_ENV === "development") {
  ReactQueryDevtools = dynamic<{ initialIsOpen: boolean }>(
    () =>
      import("react-query-devtools" as any).then((m) => m.ReactQueryDevtools),
    { ssr: true }
  );
}

const client = createClient("https://graphql-pokemon.now.sh");

gql`
  query pokemon($name: String) {
    # pokemons() {
    #   id
    # }
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

const PokemonSearch = () => {
  const { data, loading, error } = usePokemonQuery({
    variables: {
      name: "pikachu",
    },
  }) as any;

  return <pre>{JSON.stringify({ loading, data, error }, null, 2)}</pre>;
};

// const MagicalPokemonSearch = () => {
//   const { query, loading, error }: any = useMagiqlQuery("searchPokemon");
//   if (loading) {
//     return <div>loading...</div>;
//   }

//   const pokemons = query
//     .pokemons({
//       first: 10,
//     })
//     ?.map((pokemon: Pokemon) => ({
//       image: pokemon?.image,
//       id: pokemon?.id,
//       name: pokemon?.name,
//     }));

//   return <pre>{JSON.stringify({ loading, pokemons, error }, null, 2)}</pre>;
// };

const IndexPage = () => (
  <MagiqlProvider client={client}>
    <PokemonSearch />
    {/* <MagicalPokemonSearch /> */}
    <ReactQueryDevtools />
  </MagiqlProvider>
);

export default IndexPage;
