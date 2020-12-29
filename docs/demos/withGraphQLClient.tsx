import { GQLClient } from "magiql";
import { QueryClientProvider } from "react-query";
import React from "react";
import { tw } from "twind";

const client = new GQLClient({
  url: "https://poke-api-delta.vercel.app/api/graphql",
});

export function withGraphQLClient(Component) {
  return () => {
    return (
      <QueryClientProvider client={client}>
        <div className={tw`px-6 py-6 bg-gray-100`}>
          <Component />
        </div>
      </QueryClientProvider>
    );
  };
}
