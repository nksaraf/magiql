import { parseMutationArgs } from '../core/utils';
import { MutationObserver } from '../core/mutationObserver';
import { useMutationObserver } from './useMutationObserver'; // HOOK

export function useMutation(arg1, arg2, arg3) {
  var options = parseMutationArgs(arg1, arg2, arg3);
  return useMutationObserver(options, MutationObserver);
}