import _extends from "@babel/runtime/helpers/esm/extends";
// TYPES
// UTILS
export var isServer = typeof window === 'undefined';
export function noop() {
  return undefined;
}
export function functionalUpdate(updater, input) {
  return typeof updater === 'function' ? updater(input) : updater;
}
export function isValidTimeout(value) {
  return typeof value === 'number' && value >= 0 && value !== Infinity;
}
export function ensureArray(value) {
  return Array.isArray(value) ? value : [value];
}
export function difference(array1, array2) {
  return array1.filter(function (x) {
    return array2.indexOf(x) === -1;
  });
}
export function replaceAt(array, index, value) {
  var copy = array.slice(0);
  copy[index] = value;
  return copy;
}
export function timeUntilStale(updatedAt, staleTime) {
  return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
export function parseQueryArgs(arg1, arg2, arg3) {
  if (!isQueryKey(arg1)) {
    return arg1;
  }

  if (typeof arg2 === 'function') {
    return _extends({}, arg3, {
      queryKey: arg1,
      queryFn: arg2
    });
  }

  return _extends({}, arg2, {
    queryKey: arg1
  });
}
export function parseMutationArgs(arg1, arg2, arg3) {
  if (isQueryKey(arg1)) {
    if (typeof arg2 === 'function') {
      return _extends({}, arg3, {
        mutationKey: arg1,
        mutationFn: arg2
      });
    }

    return _extends({}, arg2, {
      mutationKey: arg1
    });
  }

  if (typeof arg1 === 'function') {
    return _extends({}, arg2, {
      mutationFn: arg1
    });
  }

  return _extends({}, arg1);
}
export function parseFilterArgs(arg1, arg2, arg3) {
  return isQueryKey(arg1) ? [_extends({}, arg2, {
    queryKey: arg1
  }), arg3] : [arg1 || {}, arg2];
}
export function matchQuery(filters, query) {
  var active = filters.active,
      exact = filters.exact,
      fetching = filters.fetching,
      inactive = filters.inactive,
      predicate = filters.predicate,
      queryKey = filters.queryKey,
      stale = filters.stale;

  if (isQueryKey(queryKey)) {
    if (exact) {
      var hashFn = getQueryKeyHashFn(query.options);

      if (query.queryHash !== hashFn(queryKey)) {
        return false;
      }
    } else if (!partialMatchKey(query.queryKey, queryKey)) {
      return false;
    }
  }

  var isActive;

  if (inactive === false || active && !inactive) {
    isActive = true;
  } else if (active === false || inactive && !active) {
    isActive = false;
  }

  if (typeof isActive === 'boolean' && query.isActive() !== isActive) {
    return false;
  }

  if (typeof stale === 'boolean' && query.isStale() !== stale) {
    return false;
  }

  if (typeof fetching === 'boolean' && query.isFetching() !== fetching) {
    return false;
  }

  if (predicate && !predicate(query)) {
    return false;
  }

  return true;
}
export function getQueryKeyHashFn(options) {
  return (options == null ? void 0 : options.queryKeyHashFn) || hashQueryKey;
}
/**
 * Default query keys hash function.
 */

export function hashQueryKey(queryKey) {
  return stableValueHash(queryKey);
}
/**
 * Hashes the value into a stable hash.
 */

export function stableValueHash(value) {
  return JSON.stringify(value, function (_, val) {
    return isPlainObject(val) ? Object.keys(val).sort().reduce(function (result, key) {
      result[key] = val[key];
      return result;
    }, {}) : val;
  });
}
/**
 * Checks if key `b` partially matches with key `a`.
 */

export function partialMatchKey(a, b) {
  return partialDeepEqual(ensureArray(a), ensureArray(b));
}
/**
 * Checks if `b` partially matches with `a`.
 */

export function partialDeepEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return !Object.keys(b).some(function (key) {
      return !partialDeepEqual(a[key], b[key]);
    });
  }

  return false;
}
/**
 * This function returns `a` if `b` is deeply equal.
 * If not, it will replace any deeply equal children of `b` with those of `a`.
 * This can be used for structural sharing between JSON values for example.
 */

export function replaceEqualDeep(a, b) {
  if (a === b) {
    return a;
  }

  var array = Array.isArray(a) && Array.isArray(b);

  if (array || isPlainObject(a) && isPlainObject(b)) {
    var aSize = array ? a.length : Object.keys(a).length;
    var bItems = array ? b : Object.keys(b);
    var bSize = bItems.length;
    var copy = array ? [] : {};
    var equalItems = 0;

    for (var i = 0; i < bSize; i++) {
      var key = array ? i : bItems[i];
      copy[key] = replaceEqualDeep(a[key], b[key]);

      if (copy[key] === a[key]) {
        equalItems++;
      }
    }

    return aSize === bSize && equalItems === aSize ? a : copy;
  }

  return b;
}
/**
 * Shallow compare objects. Only works with objects that always have the same properties.
 */

export function shallowEqualObjects(a, b) {
  if (a && !b || b && !a) {
    return false;
  }

  for (var key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
} // Copied from: https://github.com/jonschlinkert/is-plain-object

export function isPlainObject(o) {
  if (!hasObjectPrototype(o)) {
    return false;
  } // If has modified constructor


  var ctor = o.constructor;

  if (typeof ctor === 'undefined') {
    return true;
  } // If has modified prototype


  var prot = ctor.prototype;

  if (!hasObjectPrototype(prot)) {
    return false;
  } // If constructor does not have an Object-specific method


  if (!prot.hasOwnProperty('isPrototypeOf')) {
    return false;
  } // Most likely a plain Object


  return true;
}

function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function isQueryKey(value) {
  return typeof value === 'string' || Array.isArray(value);
}
export function isError(value) {
  return value instanceof Error;
}
export function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}
export function getStatusProps(status) {
  return {
    status: status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle'
  };
}
/**
 * Schedules a microtask.
 * This can be useful to schedule state updates after rendering.
 */

export function scheduleMicrotask(callback) {
  Promise.resolve().then(callback).catch(function (error) {
    return setTimeout(function () {
      throw error;
    });
  });
}