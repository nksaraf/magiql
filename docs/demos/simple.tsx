import { GraphQLClient, GraphQLClientProvider, graphql, useQuery } from "magiql";
import { GraphQLDevtools } from 'magiql/devtools';

const client = new GraphQLClient({
  endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index",
});


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
  `)

  return <><pre>{JSON.stringify(data, null, 2)}</pre><GraphQLDevtools buttonProps={{ 
    style: { position: 'relative' },

  }}/></>
}

export default function App() {
  return <GraphQLClientProvider client={client}> <Films /></GraphQLClientProvider>;
}