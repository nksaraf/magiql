import { GraphQLClient, GraphQLClientProvider } from "magiql";
import GraphQLDevtools from "magiql/devtools";
import ow from "oceanwind";

const client = new GraphQLClient({
  endpoint: "https://poke-api-delta.vercel.app/api/graphql",
});

export function withGraphQLClient(Component) {
  return () => {
    return (
      <GraphQLClientProvider client={client}>
        <div className={ow`px-6 py-6 bg-gray-100`}>
          <Component />
        </div>
        <GraphQLDevtools
          position="top-right"
          buttonProps={{
            style: { position: "absolute", zIndex: 100 },
          }}
        />
      </GraphQLClientProvider>
    );
  };
}
