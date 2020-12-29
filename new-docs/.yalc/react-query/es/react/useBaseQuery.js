import React from 'react';
import { notifyManager } from '../core/notifyManager';
import { useQueryErrorResetBoundary } from './QueryErrorResetBoundary';
import { useQueryClient } from './QueryClientProvider';
export function useBaseQuery(options, Observer) {
  var queryClient = useQueryClient();
  var errorResetBoundary = useQueryErrorResetBoundary();
  var defaultedOptions = queryClient.defaultQueryObserverOptions(options); // Include callbacks in batch renders

  if (defaultedOptions.onError) {
    defaultedOptions.onError = notifyManager.batchCalls(defaultedOptions.onError);
  }

  if (defaultedOptions.onSuccess) {
    defaultedOptions.onSuccess = notifyManager.batchCalls(defaultedOptions.onSuccess);
  }

  if (defaultedOptions.onSettled) {
    defaultedOptions.onSettled = notifyManager.batchCalls(defaultedOptions.onSettled);
  }

  if (defaultedOptions.suspense) {
    // Always set stale time when using suspense to prevent
    // fetching again when directly re-mounting after suspense
    if (typeof defaultedOptions.staleTime !== 'number') {
      defaultedOptions.staleTime = 1000;
    } // Prevent retrying failed query if the error boundary has not been reset yet


    if (!errorResetBoundary.isReset()) {
      defaultedOptions.retryOnMount = false;
    }
  } // Create query observer


  var observerRef = React.useRef();
  var observer = observerRef.current || new Observer(queryClient, defaultedOptions);
  observerRef.current = observer; // Update options

  if (observer.hasListeners()) {
    observer.setOptions(defaultedOptions);
  }

  var currentResult = observer.getCurrentResult(); // Remember latest result to prevent redundant renders

  var latestResultRef = React.useRef(currentResult);
  latestResultRef.current = currentResult;

  var _React$useState = React.useState({}),
      rerender = _React$useState[1]; // Subscribe to the observer


  React.useEffect(function () {
    errorResetBoundary.clearReset();
    return observer.subscribe(notifyManager.batchCalls(function (result) {
      if (result !== latestResultRef.current) {
        rerender({});
      }
    }));
  }, [observer, errorResetBoundary]); // Handle suspense

  if (observer.options.suspense || observer.options.useErrorBoundary) {
    if (observer.options.suspense && currentResult.isLoading) {
      errorResetBoundary.clearReset();
      var unsubscribe = observer.subscribe();
      throw observer.refetch().finally(unsubscribe);
    }

    if (currentResult.isError) {
      throw currentResult.error;
    }
  }

  return currentResult;
}