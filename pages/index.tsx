import { ReactQueryDevtools } from "react-query/devtools";

import React from "react";

import { useBaseQuery } from "react-query/lib/react/useBaseQuery";
import { QueryClientProvider, UseBaseQueryResult } from "react-query";
import { graphql } from "../src/relay-parser/graphql-tag";
import { getSelector, GraphQLResponse } from "relay-runtime";
import { RecordSource } from "relay-runtime";
import { stringifyData } from "../src/utils/stringify";
import { GQLClient } from "../src/gqlClient";
import { GQLFragmentObserver } from "../src/gqlFragmentObserver";
import { GQLQueryObserver } from "../src/gqlQueryObserver";

import App from "../src/demos/fragment";

export default App;
