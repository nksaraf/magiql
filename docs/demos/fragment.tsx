import { graphql, useQuery } from "magiql";
import { withGraphQLClient } from "./withGraphQLClient";
import { Pokemon, Pokemon_pokemon } from "./Pokemon";
import { Pokeball } from "./Pokeball";

function Pokemons() {
  const { data, isLoading, error } = useQuery(graphql`
    query fragmentQuery {
      pokemons {
        id
        ...${Pokemon_pokemon}
      }
    }
  `);

  if (error) {
    return <div>Error</div>;
  }

  if (isLoading) {
    return <Pokeball />;
  }

  return (
    <>
      {data.pokemons.map((poke) => (
        <Pokemon key={poke.id} pokemon={poke} />
      ))}
    </>
  );
}

export default withGraphQLClient(Pokemons);
