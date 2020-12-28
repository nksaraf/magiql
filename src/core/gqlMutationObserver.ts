import { MutationObserver, MutationObserverOptions } from "react-query/core";
import { CacheConfig, createOperationDescriptor } from "relay-runtime";
import {
  FetchResult,
  GraphQLTaggedNode,
  Operation,
  Query as IQuery,
  Response,
  Variables,
} from "../types";
import { getRequest } from "../relay-compile-tag/parser";
import { GQLClient } from "./gqlClient";
import { executeMutation } from "./relayQuery";

export interface GQLMutationObserverOptions<
  TMutation extends IQuery,
  TError = Error,
  TContext = any
> extends MutationObserverOptions<
    Response<TMutation>,
    TError,
    Variables<TMutation>,
    TContext
  > {
  mutation?: string | GraphQLTaggedNode;
  variables?: Variables<TMutation>;
  cacheConfig?: CacheConfig;
  gqlClient?: GQLClient;
}

export class GQLMutationObserver<
  TMutation extends IQuery,
  TError = Error,
  TContext = any
> extends MutationObserver<
  Response<TMutation>,
  TError,
  Variables<TMutation>,
  TContext
> {
  cacheConfig: CacheConfig;

  constructor(
    client: GQLClient,
    options: GQLMutationObserverOptions<TMutation, TError, TContext>
  ) {
    super(client, { ...options, gqlClient: client } as any);
  }

  setOptions({
    mutation,
    variables,
    ...options
  }: GQLMutationObserverOptions<TMutation, TError, TContext>) {
    const operation = createOperationDescriptor(
      getRequest(mutation),
      variables
    ) as Operation<TMutation>;

    let client = options.gqlClient || this.getOptions().gqlClient;

    super.setOptions({
      ...options,
      mutationKey: operation.request.identifier,
      mutationFn: async () => {
        const { data, combinedError } = await executeMutation(
          client.environment,
          operation
        );
        // const error = !result.data ? result.combinedError : undefined;
        // dispatchDebug({
        //   name: error ? "mutation.error" : "mutation.success",
        //   operation,
        //   data: {
        //     value: error || result,
        //   },
        // });

        if (combinedError) {
          throw combinedError;
        }

        return data;

        // return {
        //   ...result,
        //   operation,
        // };
      },
      // @ts-ignore
      gqlClient: client,
      mutation,
      variables: variables ?? {},
    });
  }

  //
  getOptions() {
    return this.options as GQLMutationObserverOptions<
      TMutation,
      TError,
      TContext
    >;
  }
}
