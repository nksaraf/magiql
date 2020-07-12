import React from "react";
import { useClient } from "./client";
import { getOperationName, useMountedCallback } from "./utils";
import { UseQueryOptions, UseQueryResult } from "./useQuery";

export function useSubscription<
  TData,
  TVariables extends object,
  TError = Error
>(
  subscription: string,
  {
    variables = {} as TVariables,
    operationName = getOperationName(subscription),
    ...options
  }: UseQueryOptions<TData, TVariables, TError> = {}
): UseQueryResult<TData, TError> {
  const rerender = useMountedCallback(React.useState()[1]);

  const client = useClient();

  const query = client.cache.buildQuery(
    [operationName, { variables: variables }],
    options
  );

  const instanceRef = React.useRef<{ unsubscribe: () => void }>();

  React.useEffect(() => {
    if (!client.subscriptions) {
      throw new Error(
        "Subscriptions have not been enabled. Pass the subscriptions option to createClient."
      );
    }

    instanceRef.current = query.subscribe(() => rerender({}));

    const observable = client.subscriptions.client.request({
      query: subscription,
      variables: variables,
      operationName,
    });

    const sub = observable.subscribe({
      next: (result) => {
        query.setData(result.data);
      },
      error: (error) => {
        query.setState((state: any) => ({
          ...state,
          status: "error",
          isError: true,
          isFetching: false,
          isStale: true,
          error,
        }));
        sub.unsubscribe();
      },
      complete: () => {
        sub.unsubscribe();
      },
    });
    return () => {
      instanceRef.current.unsubscribe();
      sub.unsubscribe();
    };
  }, [query, rerender]);

  return {
    query,
    ...query.state,
  } as any;
}
