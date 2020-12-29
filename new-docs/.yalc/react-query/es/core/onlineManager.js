import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import { Subscribable } from './subscribable';
import { isServer } from './utils';

var OnlineManager = /*#__PURE__*/function (_Subscribable) {
  _inheritsLoose(OnlineManager, _Subscribable);

  function OnlineManager() {
    return _Subscribable.apply(this, arguments) || this;
  }

  var _proto = OnlineManager.prototype;

  _proto.onSubscribe = function onSubscribe() {
    if (!this.removeEventListener) {
      this.setDefaultEventListener();
    }
  };

  _proto.setEventListener = function setEventListener(setup) {
    var _this = this;

    if (this.removeEventListener) {
      this.removeEventListener();
    }

    this.removeEventListener = setup(function (online) {
      if (typeof online === 'boolean') {
        _this.setOnline(online);
      } else {
        _this.onOnline();
      }
    });
  };

  _proto.setOnline = function setOnline(online) {
    this.online = online;

    if (online) {
      this.onOnline();
    }
  };

  _proto.onOnline = function onOnline() {
    this.listeners.forEach(function (listener) {
      listener();
    });
  };

  _proto.isOnline = function isOnline() {
    if (typeof this.online === 'boolean') {
      return this.online;
    }

    return navigator.onLine === undefined || navigator.onLine;
  };

  _proto.setDefaultEventListener = function setDefaultEventListener() {
    var _window;

    if (!isServer && ((_window = window) == null ? void 0 : _window.addEventListener)) {
      this.setEventListener(function (onOnline) {
        // Listen to online
        window.addEventListener('online', onOnline, false);
        return function () {
          // Be sure to unsubscribe if a new handler is set
          window.removeEventListener('online', onOnline);
        };
      });
    }
  };

  return OnlineManager;
}(Subscribable);

export var onlineManager = new OnlineManager();