import { MutationObserver, MutationObserverOptions } from 'react-query/core';
import { CacheConfig, createOperationDescriptor } from 'relay-runtime';
import {
  FetchResult,
  GraphQLTaggedNode,
  Operation,
  Query as IQuery,
  Response,
  Variables,
} from './types';
import { getRequest } from "../relay-compile-tag";
import { GQLClient } from './gqlClient';
import { executeMutation } from './relayQuery';

export interface GQLMutationObserverOptions<
  TMutation extends IQuery,
  TError = Error,
  TContext = any
>
  extends MutationObserverOptions<
    Response<TMutation>,
    TError,
    Variables<TMutation>,
    TContext
  > {
  mutation: string | GraphQLTaggedNode;
  cacheConfig: CacheConfig;
  gqlClient: GQLClient;
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
  _options: GQLMutationObserverOptions<TMutation, TError, TContext>;

  constructor(
    client: GQLClient,
    options: GQLMutationObserverOptions<TMutation, TError, TContext>,
  ) {
    super(client, { ...options, gqlClient: client } as any);
  }

  getOptions() {
    return this.options as GQLMutationObserverOptions<
      TMutation,
      TError,
      TContext
    >;
  }

  setOptions({
    mutation,
    ...options
  }: GQLMutationObserverOptions<TMutation, TError, TContext>) {
    let client = options.gqlClient || this.getOptions().gqlClient!;
    let node = getRequest(mutation!);

    let mutationOptions: GQLMutationObserverOptions<
      TMutation,
      TError,
      TContext
    > = {
      ...options,
      mutationKey: node.operation.name,
      mutationFn: async variables => {
        const operation = createOperationDescriptor(
          node,
          variables,
        ) as Operation<TMutation>;

        const { data, combinedError } = await executeMutation(
          client.environment,
          operation,
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
    };

    super.setOptions(mutationOptions);
  }
}
