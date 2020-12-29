import { graphql, useQuery } from 'magiql';
import { withGQLClient } from './withGQLClient';
import { Pokemon, Pokemon_pokemon } from './Pokemon';
import { Pokeball } from './Pokeball';
import React from 'react';
import { tw } from 'twind';
import { css } from 'twind/css';

function Pokemons() {
  const [limit, setLimit] = React.useState(5);
  const { data, isLoading, status, error } = useQuery(
    graphql`
    query simplePokemonQuery($limit: number) {
      pokemons(limit: $limit) {
        id
        ...${Pokemon_pokemon}
      }
    }
  `,
    {
      variables: {
        limit: limit,
      },
    },
  );

  return (
    <>
      <div className={tw`flex flex-row`}>
        <input
          value={limit}
          onChange={e => setLimit(Number(e.currentTarget.value))}
          type="number"
        />
      </div>
      {error && (
        <div className={tw`flex flex-row`}>
          <Pokeball state="error" />
          <div className={tw`flex-1 overflow-scroll `}>
            <pre
              className={tw`${css({
                'white-space': 'pre-wrap',
              })}text-sm text-gray-400 bg-gray-100! text-wrap`}
            >
              {error.message}
            </pre>
          </div>
        </div>
      )}
      {isLoading && <Pokeball state="loading" />}
      {data?.pokemons &&
        data.pokemons.map(poke => <Pokemon key={poke.id} pokemon={poke} />)}
    </>
  );
}

export default withGQLClient(Pokemons);
