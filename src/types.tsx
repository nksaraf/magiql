import {
  ConcreteRequest,
  GraphQLTaggedNode,
  NormalizationSelector,
  SingularReaderSelector,
} from "relay-runtime";
import {
  ReaderLinkedField,
  ReaderCondition,
  ReaderFragment,
  ReaderInlineFragment,
} from "relay-runtime/lib/util/ReaderNode";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { GraphQLClient } from "./client";
import { CombinedError } from "./error";

export type {
  ConcreteRequest,
  NormalizationSelector,
  ReaderSelector,
  GraphQLTaggedNode,
  SingularReaderSelector,
} from "relay-runtime";

export type { QueryObserver } from "react-query/types/core/queryObserver";

export type {
  ReaderFragmentSpread,
  ReaderLinkedField,
  ReaderScalarField,
  ReaderSelection,
} from "relay-runtime/lib/util/ReaderNode";

export { CombinedError };

export type ReaderNode =
  | ReaderCondition
  | ReaderLinkedField
  | ReaderFragment
  | ReaderInlineFragment;

export type Record = { [key: string]: any };

export type RecordSource = { [key: string]: any };

export type { QueryCache, Query as CachedQuery } from "react-query";

export type QueryStatus = "success" | "loading" | "error" | "idle";

export type OperationKind = "query" | "mutation" | "subscription";

export interface Query {
  response: any;
  variables: any;
}

export type Response<TQuery extends Query> = TQuery["response"];

export type Variables<TQuery extends Query> = TQuery["variables"];

export const constants = {
  FRAGMENTS_KEY: "__fragments",
  FRAGMENT_OWNER_KEY: "__fragmentOwner",
  FRAGMENT_PROP_NAME_KEY: "__fragmentPropName",
  MODULE_COMPONENT_KEY: "__module_component",
  ID_KEY: "__id",
  REF_KEY: "__ref",
  REFS_KEY: "__refs",
  ROOT_ID: "client:root",
  ROOT_TYPE: "__Root",
  TYPENAME_KEY: "__typename",
  INVALIDATED_AT_KEY: "__invalidated_at",
  IS_WITHIN_UNMATCHED_TYPE_REFINEMENT: "__isWithinUnmatchedTypeRefinement",
};

export interface RequestDescriptor<TVariables> {
  /** Relay: Hashed ID of the query, Raw:  */
  readonly identifier: string;
  /** Contains DocumentNode of the GraphQL Tree. AST Structure */
  readonly node: ConcreteRequest;
  readonly fetchOptions?: FetchOptions<TVariables>;
  /** Variables for GraphQL query */
  readonly variables: TVariables;
}

export interface Operation<TQuery extends Query> {
  /** Selector to read data from store for this operation */
  readonly fragment: SingularReaderSelector;
  /** Description of query: text, variables, hash, etc */
  readonly request: RequestDescriptor<Variables<TQuery>>;
  readonly root?: NormalizationSelector;
  readonly response: Response<TQuery>;
}

export interface FetchRequestOptions extends Omit<RequestInit, "body"> {
  headers?: { [key: string]: any };
}

export interface FetchOperation<TVariables> {
  query: string | GraphQLTaggedNode;
  operationName?: string;
  operationKind?: OperationKind;
  variables?: TVariables;
  endpoint: string;
  fetchOptions?: FetchOptions<TVariables>;
}

export type FetchOptionsFn<TVariables> = (
  operation: Omit<FetchOperation<TVariables>, "fetchOptions">
) => FetchRequestOptions | Promise<FetchRequestOptions>;

export type FetchOptions<TVariables> =
  | FetchOptionsFn<TVariables>
  | FetchRequestOptions;

export interface FetchResult<TQuery extends Query> {
  data?: Response<TQuery>;
  error?: CombinedError;
  extensions?: any;
}

export interface OperationResult<TQuery extends Query>
  extends FetchResult<TQuery> {
  operation: Operation<TQuery>;
}

export type Snapshot<TData> = TData;

export interface GraphQLVariables<TVariables> {
  variables?: TVariables;
}

export type QueryKey<TQuery extends Query> = [string, Variables<TQuery>];

export type InfiniteQueryKey<TQuery extends Query> = [
  string,
  Variables<TQuery>,
  Partial<Variables<TQuery>>
];

export interface KeyType {
  readonly " $data"?: unknown;
}

export type KeyReturnType<T extends KeyType> = (
  arg: T
) => NonNullable<T[" $data"]>;

export type $Call<Fn extends (...args: any[]) => any> = Fn extends (
  arg: any
) => infer RT
  ? RT
  : never;

export interface Normalizer {
  normalizeResponse: (data: any, operation: Operation<Query>) => any;
}

export interface Store {
  type: "normalized" | "unnormalized";
  update(recordSource: any): void;
  updateRecord(id: string, record: any): void;
  get(dataID: string): any;
  commit<TQuery extends Query>(
    operation: Operation<TQuery>,
    data: Response<TQuery>
  ): void;
  useFragment<TKey extends KeyType>(
    fragmentNode: ReaderFragment,
    fragmentRef: TKey
  ): $Call<KeyReturnType<TKey>>;
  useOperation<TQuery extends Query>(
    operation: Operation<TQuery>
  ): Response<TQuery>;
  useEntities(): [string, { [key: string]: any }][];
  useOperationPages<TQuery extends Query>(
    operation: Operation<TQuery>,
    pageVariables: any[]
  ): Response<TQuery>[];
  Provider?: React.FC<{ children: React.ReactNode }>;
}

export type GetDataID = (record: any, type: any) => string | null;

export type ExchangeOp = (
  operation: Operation<Query>
) => Promise<FetchResult<Query>>;

/** Input parameters for to an Exchange factory function. */
export interface ExchangeInput {
  client: GraphQLClient;
  forward: ExchangeIO;
  dispatchDebug: <TQuery extends Query>(event: DebugEvent<TQuery>) => void;
}

export type DebugEvent<TQuery extends Query> = {
  type: string;
  data: any;
  message: string;
  operation: Operation<TQuery>;
  timestamp?: number;
  source?: string;
};

/** Function responsible for listening for streamed [operations]{@link Operation}. */
export type Exchange = ((input: ExchangeInput) => ExchangeIO) & {
  emoji?: string;
};

/** Function responsible for receiving an observable [operation]{@link Operation} and returning a [result]{@link OperationResult}. */
export type ExchangeIO = <TQuery extends Query>(
  operation: Operation<TQuery>
) => Promise<OperationResult<TQuery>>;