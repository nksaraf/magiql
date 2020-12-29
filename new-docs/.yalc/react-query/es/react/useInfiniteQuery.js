import { InfiniteQueryObserver } from '../core/infiniteQueryObserver';
import { parseQueryArgs } from '../core/utils';
import { useQueryObserver } from './useQueryObserver'; // HOOK

export function useInfiniteQuery(arg1, arg2, arg3) {
  var options = parseQueryArgs(arg1, arg2, arg3);
  return useQueryObserver(options, InfiniteQueryObserver);
}