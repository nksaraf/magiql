import { GraphQLClient, GraphQLClientProvider, graphql, useQuery } from "magiql";
import { Film_film, Film } from "./Film";

const client = new GraphQLClient({
  endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index",
});


function Films() {
  const { data, isLoading, error } = useQuery(graphql`
    query fragmentQuery {
  allFilms {
    edges {
      node {
        id
        title
        ...Film_film
      }
    }
  }
}
  `)

  if (error) {
    return <div>Error</div>
  }

  if (isLoading) {
    return <div>Loading</div>
  }

  // return <pre>{JSON.stringify(data, null, 2)}</pre>

  return <>{data.allFilms.edges.map(edge => <Film film={edge.node} />)}</>

}

export default function App() {
  return <GraphQLClientProvider client={client}> <Films /></GraphQLClientProvider>;
}