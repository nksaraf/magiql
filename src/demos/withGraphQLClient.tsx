import { QueryClientProvider } from "react-query";
import { tw } from "twind";
import { GQLClient } from "../index";

const client = new GQLClient({
  url: "https://qwerty-ts.herokuapp.com/v1/graphql",
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
