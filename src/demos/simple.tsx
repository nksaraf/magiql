import { graphql, useQuery } from "../index";
import { withGraphQLClient } from "./withGraphQLClient";

function Films() {
  const { data, status, error } = useQuery(graphql`
    query simpleQuery {
      allFilms {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `);

  return (
    <>
      <pre>{JSON.stringify({ data, status, error }, null, 2)}</pre>
    </>
  );
}

export default withGraphQLClient(Films);
