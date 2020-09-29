import React from "react";
import { getRequest } from "../core/operation";

import { Query, Variables, GraphQLTaggedNode } from "../core/types";
import { useRerenderer } from "./useRerenderer";
import { useGraphQLClient } from "./useGraphQLClient";
import { UseQueryOptions, UseQueryResult } from "./useQuery";
import { useGraphQLStore } from "./useGraphQLStore";

export function useSubscription<
  TSubscription extends Query,
  TError extends Error = Error
>(
  subscription: GraphQLTaggedNode,
  {
    variables = {} as Variables<TSubscription>,
    ...options
  }: UseQueryOptions<TSubscription, Error> = {}
): UseQueryResult<TSubscription, TError> {
  const client = useGraphQLClient();
  const store = useGraphQLStore();
  const rerender = useRerenderer();
  const node = getRequest(subscription);
  const operation = client.buildOperation(node, variables);
  const subscriptionQuery = client.buildSubscription(operation, options);
  const instanceRef = React.useRef<{ unsubscribe: () => void }>();

  React.useEffect(() => {
    if (!client.subscriptionClient) {
      throw new Error(
        "Subscriptions have not been enabled. Pass the subscriptions option to createClient."
      );
    }

    instanceRef.current = subscriptionQuery.query.subscribe(() => rerender());

    subscriptionQuery.execute();

    return () => {
      instanceRef.current?.unsubscribe();
      subscriptionQuery.unsubscribe();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionQuery.query, rerender]);

  return {
    query: subscriptionQuery.query,
    ...subscriptionQuery.query.state,
  } as any;
}
