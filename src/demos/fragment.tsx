import { graphql, useQuery } from "../index";
import { withGraphQLClient } from "./withGraphQLClient";
import { Profile, Profile_profile } from "./Profile";
import { Pokeball } from "./Pokeball";
import { tw } from "twind";

function Pokemons() {
  const { data, isLoading, error } = useQuery(graphql`
    query fragmentQuery {
      profiles {
        profileId
        ...${Profile_profile}
      }
    }
  `);

  console.log("heree");

  if (error) {
    return <div>Error</div>;
  }

  if (isLoading) {
    return <Pokeball />;
  }

  return (
    <div className={tw`w-screen`}>
      {data.profiles.map(poke => (
        <Profile key={poke.id} profile={poke} />
      ))}
    </div>
  );
}

export default withGraphQLClient(Pokemons);
