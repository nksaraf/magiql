import { QueryObserver } from '../core';
import { parseQueryArgs } from '../core/utils';
import { useQueryObserver } from './useQueryObserver'; // HOOK

export function useQuery(arg1, arg2, arg3) {
  var parsedOptions = parseQueryArgs(arg1, arg2, arg3);
  return useQueryObserver(parsedOptions, QueryObserver);
}