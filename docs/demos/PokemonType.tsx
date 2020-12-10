import { graphql, useFragment } from "magiql";
import ow from "oceanwind";

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
      className={ow`text-white p-2 py-1 rounded-md text-sm`}
      style={{ backgroundColor: data.color }}
    >
      {data.name}
    </div>
  );
}
