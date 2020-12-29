import _extends from "@babel/runtime/helpers/esm/extends";
import React from 'react';
import { notifyManager } from '../core/notifyManager';
import { noop } from '../core/utils';
import { useQueryClient } from './QueryClientProvider';
export function useMutationObserver(options, Observer) {
  var queryClient = useQueryClient(); // Create mutation observer

  var observerRef = React.useRef();
  var observer = observerRef.current || new Observer(queryClient, options);
  observerRef.current = observer; // Update options

  if (observer.hasListeners()) {
    observer.setOptions(options);
  }

  var _React$useState = React.useState(function () {
    return observer.getCurrentResult();
  }),
      currentResult = _React$useState[0],
      setCurrentResult = _React$useState[1]; // Subscribe to the observer


  React.useEffect(function () {
    return observer.subscribe(notifyManager.batchCalls(function (result) {
      // Check if the component is still mounted
      if (observer.hasListeners()) {
        setCurrentResult(result);
      }
    }));
  }, [observer]);
  var mutate = React.useCallback(function (variables, mutateOptions) {
    observer.mutate(variables, mutateOptions).catch(noop);
  }, [observer]);

  if (currentResult.error && observer.options.useErrorBoundary) {
    throw currentResult.error;
  }

  return _extends({}, currentResult, {
    mutate: mutate,
    mutateAsync: currentResult.mutate
  });
}