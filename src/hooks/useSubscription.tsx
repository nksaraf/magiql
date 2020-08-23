import React from "react";
import { getRequest, GraphQLTaggedNode } from "relay-runtime";

import { Query, Variables } from "../types";
import { useRerenderer } from "../utils";
import { useClient } from "./useClient";
import { UseQueryOptions, UseQueryResult } from "./useQuery";

export function useSubscription<TSubscription extends Query, TError = Error>(
  subscription: GraphQLTaggedNode,
  {
    variables = {} as Variables<TSubscription>,
    ...options
  }: UseQueryOptions<TSubscription, TError> = {}
): UseQueryResult<TSubscription, TError> {
  const client = useClient();
  const rerender = useRerenderer();
  const node = getRequest(subscription);
  const operation = client.buildOperation(node, variables);
  const subscriptionQuery = client.buildSubscription(operation, options);
  const instanceRef = React.useRef<{ unsubscribe: () => void }>();

  React.useEffect(() => {
    if (!client.subscriptions) {
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
