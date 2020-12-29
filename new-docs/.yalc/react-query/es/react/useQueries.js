import React from 'react';
import { QueryObserver } from '../core';
import { notifyManager } from '../core/notifyManager';
import { QueriesObserver } from '../core/queriesObserver';
import { useQueryClient } from './QueryClientProvider';
export function useQueries(queries) {
  return useQueriesObserver(queries, QueryObserver);
}
export function useQueriesObserver(queries, Observer) {
  var queryClient = useQueryClient(); // Create queries observer

  var observerRef = React.useRef();
  var observer = observerRef.current || new QueriesObserver(queryClient, queries, Observer);
  observerRef.current = observer; // Update queries

  if (observer.hasListeners()) {
    observer.setQueries(queries);
  }

  var _React$useState = React.useState(function () {
    return observer.getCurrentResult();
  }),
      currentResult = _React$useState[0],
      setCurrentResult = _React$useState[1]; // Subscribe to the observer


  React.useEffect(function () {
    return observer.subscribe(notifyManager.batchCalls(setCurrentResult));
  }, [observer]);
  return currentResult;
}