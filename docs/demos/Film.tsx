import { graphql, useFragment } from "magiql";

export const Film_film = graphql`
  fragment Film_film on Film {
    id
    title
  }
`;
export function Film({ film }) {
  const data = useFragment(Film_film, film);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;

}
