import { graphql, useQuery } from 'magiql';
import { withGQLClient } from './withGQLClient';
import { Pokemon, Pokemon_pokemon } from './Pokemon';
import { Pokeball } from './Pokeball';
import React from 'react';

function Pokemons() {
  const { data, isLoading, status, error } = useQuery(graphql`
    query fragmentQuery {
      pokemons {
        id
        ...${Pokemon_pokemon}
      }
    }
  `);

  console.log(isLoading, status);

  if (error) {
    return <div>Error</div>;
  }

  if (isLoading) {
    return <Pokeball />;
  }

  return (
    <>
      {data.pokemons.map(poke => (
        <Pokemon key={poke.id} pokemon={poke} />
      ))}
    </>
  );
}

export default withGQLClient(Pokemons);
