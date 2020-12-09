import { stableStringify } from "../utils/stringify";
import React from "react";

import { createOperation, getRequest } from "../operation/operation";
import { GraphQLTaggedNode, Operation, Variables, Query } from "../types";

export function useMemoOperationDescriptor<TQuery extends Query>(
  gqlQuery: GraphQLTaggedNode | string,
  variables: Variables<TQuery>
): Operation<TQuery> {
  const [memoVariables] = useMemoVariables(variables);
  return React.useMemo(
    () => createOperation(getRequest(gqlQuery), memoVariables),
    [gqlQuery, memoVariables]
  );
}

const areEqual = (a, b) => stableStringify(a) === stableStringify(b);

export function useMemoVariables<TVariables>(
  variables: TVariables
): [TVariables, number] {
  // The value of this ref is a counter that should be incremented when
  // variables change. This allows us to use the counter as a
  // memoization value to indicate if the computation for useMemo
  // should be re-executed.
  const variablesChangedGenerationRef = React.useRef(0);

  // We mirror the variables to check if they have changed between renders
  const [mirroredVariables, setMirroredVariables] = React.useState<TVariables>(
    variables
  );

  const variablesChanged = !areEqual(variables, mirroredVariables);
  if (variablesChanged) {
    variablesChangedGenerationRef.current =
      (variablesChangedGenerationRef.current ?? 0) + 1;
    setMirroredVariables(variables);
  }

  // NOTE: We disable react-hooks-deps warning because we explicitly
  // don't want to memoize on object identity
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoVariables = React.useMemo(() => variables, [
    variablesChangedGenerationRef.current,
  ]);
  return [memoVariables, variablesChangedGenerationRef.current ?? 0];
}
