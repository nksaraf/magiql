import { graphql, useFragment } from 'magiql';
import { tw } from 'twind';
import React from 'react';

export const PokemonType_pokemonType = graphql`
  fragment PokemonType_pokemonType on PokemonType {
    name
    color
    id
  }
`;

export function PokemonType({ pokemonType }) {
  const data = useFragment(PokemonType_pokemonType, pokemonType);
  return (
    <div
      className={tw`text-white p-2 py-1 rounded-md text-sm`}
      style={{ backgroundColor: data.color }}
    >
      {data.name}
    </div>
  );
}
