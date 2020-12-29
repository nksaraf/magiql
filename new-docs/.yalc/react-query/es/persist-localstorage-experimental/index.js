import { dehydrate, hydrate } from '../hydration';
export function persistWithLocalStorage(queryClient, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$localStorageKey = _ref.localStorageKey,
      localStorageKey = _ref$localStorageKey === void 0 ? "REACT_QUERY_OFFLINE_CACHE" : _ref$localStorageKey,
      _ref$throttleTime = _ref.throttleTime,
      throttleTime = _ref$throttleTime === void 0 ? 1000 : _ref$throttleTime,
      _ref$maxAge = _ref.maxAge,
      maxAge = _ref$maxAge === void 0 ? 1000 * 60 * 60 * 24 : _ref$maxAge,
      _ref$buster = _ref.buster,
      buster = _ref$buster === void 0 ? '' : _ref$buster;

  if (typeof window !== 'undefined') {
    // Subscribe to changes
    var saveCache = throttle(function () {
      var storageCache = {
        buster: buster,
        timestamp: Date.now(),
        cacheState: dehydrate(queryClient)
      };
      localStorage.setItem(localStorageKey, JSON.stringify(storageCache));
    }, throttleTime);
    queryClient.getQueryCache().subscribe(saveCache); // Attempt restore

    var cacheStorage = localStorage.getItem(localStorageKey);

    if (!cacheStorage) {
      return;
    }

    var cache = JSON.parse(cacheStorage);

    if (cache.timestamp) {
      var expired = Date.now() - cache.timestamp > maxAge;
      var busted = cache.buster !== buster;

      if (expired || busted) {
        localStorage.removeItem(localStorageKey);
      } else {
        hydrate(queryClient, cache.cacheState);
      }
    } else {
      localStorage.removeItem(localStorageKey);
    }
  }
}

function throttle(func, wait) {
  if (wait === void 0) {
    wait = 100;
  }

  var timer = null;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (timer === null) {
      timer = setTimeout(function () {
        func.apply(void 0, args);
        timer = null;
      }, wait);
    }
  };
}