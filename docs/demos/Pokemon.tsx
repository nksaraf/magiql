import { graphql, useFragment } from "magiql";
import { tw } from "twind";
import { PokemonType, PokemonType_pokemonType } from "./PokemonType";
import React from "react";

export const Pokemon_pokemon = graphql`
  fragment Pokemon_pokemon on Pokemon {
    id
    name
    sprites {
      normal
    }
    types {
      ...${PokemonType_pokemonType}
    }
  }
`;

export function Pokemon({ pokemon }) {
  const data = useFragment(Pokemon_pokemon, pokemon);

  return (
    <div
      className={tw`flex flex-row items-center shadow-md rounded-lg mb-3 gap-3 w-3/4 bg-white`}
    >
      <img height={48} width={48} src={data.sprites.normal} />
      <span className={tw`text-sm text-gray-400`}>{data.id}</span>
      {data.name}
      <div className={tw`flex flex-row gap-2 items-center`}>
        {data.types.map((type) => (
          <PokemonType pokemonType={type} />
        ))}
      </div>
    </div>
  );
}
