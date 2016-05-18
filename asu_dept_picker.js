(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @file
 * Javascript for ASU Dept Picker
 *
 * Requires React/ReactDOM
 */
var AsuDeptPicker = require('./components/asu-dept-picker.jsx');

/**
 * Provides an ASU department picker widget.
 */
(function ($) {
  Drupal.behaviors.asu_dept_picker = {
    attach: function(context, settings) {
      // setup any asu-dept-picker fields
      $('.asu-dept-picker:not([data-reactid])', context).each(function() {
        var delta = $(this).attr('data-delta');
        var config = settings.asu_dept_picker[delta];

        var asu_dept_picker = React.createElement(AsuDeptPicker, config);
        ReactDOM.render(asu_dept_picker, this);
      });
    }
  }
})(jQuery);


},{"./components/asu-dept-picker.jsx":22}],2:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} [once=false] Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Hold the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var events = this._events
    , names = []
    , name;

  if (!events) return names;

  for (name in events) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],3:[function(require,module,exports){
/**
 * A module of methods that you want to include in all actions.
 * This module is consumed by `createAction`.
 */
"use strict";

module.exports = {};
},{}],4:[function(require,module,exports){
"use strict";

exports.createdStores = [];

exports.createdActions = [];

exports.reset = function () {
    while (exports.createdStores.length) {
        exports.createdStores.pop();
    }
    while (exports.createdActions.length) {
        exports.createdActions.pop();
    }
};
},{}],5:[function(require,module,exports){
"use strict";

var _ = require("./utils"),
    maker = require("./joins").instanceJoinCreator;

/**
 * Extract child listenables from a parent from their
 * children property and return them in a keyed Object
 *
 * @param {Object} listenable The parent listenable
 */
var mapChildListenables = function mapChildListenables(listenable) {
    var i = 0,
        children = {},
        childName;
    for (; i < (listenable.children || []).length; ++i) {
        childName = listenable.children[i];
        if (listenable[childName]) {
            children[childName] = listenable[childName];
        }
    }
    return children;
};

/**
 * Make a flat dictionary of all listenables including their
 * possible children (recursively), concatenating names in camelCase.
 *
 * @param {Object} listenables The top-level listenables
 */
var flattenListenables = function flattenListenables(listenables) {
    var flattened = {};
    for (var key in listenables) {
        var listenable = listenables[key];
        var childMap = mapChildListenables(listenable);

        // recursively flatten children
        var children = flattenListenables(childMap);

        // add the primary listenable and chilren
        flattened[key] = listenable;
        for (var childKey in children) {
            var childListenable = children[childKey];
            flattened[key + _.capitalize(childKey)] = childListenable;
        }
    }

    return flattened;
};

/**
 * A module of methods related to listening.
 */
module.exports = {

    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Action|Store} listenable The listenable we want to search for
     * @returns {Boolean} The result of a recursive search among `this.subscriptions`
     */
    hasListener: function hasListener(listenable) {
        var i = 0,
            j,
            listener,
            listenables;
        for (; i < (this.subscriptions || []).length; ++i) {
            listenables = [].concat(this.subscriptions[i].listenable);
            for (j = 0; j < listenables.length; j++) {
                listener = listenables[j];
                if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * A convenience method that listens to all listenables in the given object.
     *
     * @param {Object} listenables An object of listenables. Keys will be used as callback method names.
     */
    listenToMany: function listenToMany(listenables) {
        var allListenables = flattenListenables(listenables);
        for (var key in allListenables) {
            var cbname = _.callbackName(key),
                localname = this[cbname] ? cbname : this[key] ? key : undefined;
            if (localname) {
                this.listenTo(allListenables[key], localname, this[cbname + "Default"] || this[localname + "Default"] || localname);
            }
        }
    },

    /**
     * Checks if the current context can listen to the supplied listenable
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @returns {String|Undefined} An error message, or undefined if there was no problem.
     */
    validateListening: function validateListening(listenable) {
        if (listenable === this) {
            return "Listener is not able to listen to itself";
        }
        if (!_.isFunction(listenable.listen)) {
            return listenable + " is missing a listen method";
        }
        if (listenable.hasListener && listenable.hasListener(this)) {
            return "Listener cannot listen to this listenable because of circular loop";
        }
    },

    /**
     * Sets up a subscription to the given listenable for the context object
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function|String} callback The callback to register as event handler
     * @param {Function|String} defaultCallback The callback to register as default handler
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
     */
    listenTo: function listenTo(listenable, callback, defaultCallback) {
        var desub,
            unsubscriber,
            subscriptionobj,
            subs = this.subscriptions = this.subscriptions || [];
        _.throwIf(this.validateListening(listenable));
        this.fetchInitialState(listenable, defaultCallback);
        desub = listenable.listen(this[callback] || callback, this);
        unsubscriber = function () {
            var index = subs.indexOf(subscriptionobj);
            _.throwIf(index === -1, "Tried to remove listen already gone from subscriptions list!");
            subs.splice(index, 1);
            desub();
        };
        subscriptionobj = {
            stop: unsubscriber,
            listenable: listenable
        };
        subs.push(subscriptionobj);
        return subscriptionobj;
    },

    /**
     * Stops listening to a single listenable
     *
     * @param {Action|Store} listenable The action or store we no longer want to listen to
     * @returns {Boolean} True if a subscription was found and removed, otherwise false.
     */
    stopListeningTo: function stopListeningTo(listenable) {
        var sub,
            i = 0,
            subs = this.subscriptions || [];
        for (; i < subs.length; i++) {
            sub = subs[i];
            if (sub.listenable === listenable) {
                sub.stop();
                _.throwIf(subs.indexOf(sub) !== -1, "Failed to remove listen from subscriptions list!");
                return true;
            }
        }
        return false;
    },

    /**
     * Stops all subscriptions and empties subscriptions array
     */
    stopListeningToAll: function stopListeningToAll() {
        var remaining,
            subs = this.subscriptions || [];
        while (remaining = subs.length) {
            subs[0].stop();
            _.throwIf(subs.length !== remaining - 1, "Failed to remove listen from subscriptions list!");
        }
    },

    /**
     * Used in `listenTo`. Fetches initial data from a publisher if it has a `getInitialState` method.
     * @param {Action|Store} listenable The publisher we want to get initial state from
     * @param {Function|String} defaultCallback The method to receive the data
     */
    fetchInitialState: function fetchInitialState(listenable, defaultCallback) {
        defaultCallback = defaultCallback && this[defaultCallback] || defaultCallback;
        var me = this;
        if (_.isFunction(defaultCallback) && _.isFunction(listenable.getInitialState)) {
            var data = listenable.getInitialState();
            if (data && _.isFunction(data.then)) {
                data.then(function () {
                    defaultCallback.apply(me, arguments);
                });
            } else {
                defaultCallback.call(this, data);
            }
        }
    },

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the last emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinTrailing: maker("last"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the first emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinLeading: maker("first"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with all emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinConcat: maker("all"),

    /**
     * The callback will be called once all listenables have triggered.
     * If a callback triggers twice before that happens, an error is thrown.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinStrict: maker("strict")
};
},{"./joins":12,"./utils":14}],6:[function(require,module,exports){
"use strict";

var _ = require("./utils");

/**
 * A module of methods for object that you want to be able to listen to.
 * This module is consumed by `createStore` and `createAction`
 */
module.exports = {

    /**
     * Hook used by the publisher that is invoked before emitting
     * and before `shouldEmit`. The arguments are the ones that the action
     * is invoked with. If this function returns something other than
     * undefined, that will be passed on as arguments for shouldEmit and
     * emission.
     */
    preEmit: function preEmit() {},

    /**
     * Hook used by the publisher after `preEmit` to determine if the
     * event should be emitted with given arguments. This may be overridden
     * in your application, default implementation always returns true.
     *
     * @returns {Boolean} true if event should be emitted
     */
    shouldEmit: function shouldEmit() {
        return true;
    },

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Function} callback The callback to register as event handler
     * @param {Mixed} [optional] bindContext The context to bind the callback with
     * @returns {Function} Callback that unsubscribes the registered event handler
     */
    listen: function listen(callback, bindContext) {
        bindContext = bindContext || this;
        var eventHandler = function eventHandler(args) {
            if (aborted) {
                return;
            }
            callback.apply(bindContext, args);
        },
            me = this,
            aborted = false;
        this.emitter.addListener(this.eventLabel, eventHandler);
        return function () {
            aborted = true;
            me.emitter.removeListener(me.eventLabel, eventHandler);
        };
    },

    /**
     * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
     */
    trigger: function trigger() {
        var args = arguments,
            pre = this.preEmit.apply(this, args);
        args = pre === undefined ? args : _.isArguments(pre) ? pre : [].concat(pre);
        if (this.shouldEmit.apply(this, args)) {
            this.emitter.emit(this.eventLabel, args);
        }
    },

    /**
     * Tries to publish the event on the next tick
     */
    triggerAsync: function triggerAsync() {
        var args = arguments,
            me = this;
        _.nextTick(function () {
            me.trigger.apply(me, args);
        });
    },

    /**
     * Wraps the trigger mechanism with a deferral function.
     *
     * @param {Function} callback the deferral function,
     *        first argument is the resolving function and the
     *        rest are the arguments provided from the previous
     *        trigger invocation
     */
    deferWith: function deferWith(callback) {
        var oldTrigger = this.trigger,
            ctx = this,
            resolver = function resolver() {
            oldTrigger.apply(ctx, arguments);
        };
        this.trigger = function () {
            callback.apply(ctx, [resolver].concat([].splice.call(arguments, 0)));
        };
    }

};
},{"./utils":14}],7:[function(require,module,exports){
/**
 * A module of methods that you want to include in all stores.
 * This module is consumed by `createStore`.
 */
"use strict";

module.exports = {};
},{}],8:[function(require,module,exports){
"use strict";

module.exports = function (store, definition) {
    for (var name in definition) {
        if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
            var propertyDescriptor = Object.getOwnPropertyDescriptor(definition, name);

            if (!propertyDescriptor.value || typeof propertyDescriptor.value !== "function" || !definition.hasOwnProperty(name)) {
                continue;
            }

            store[name] = definition[name].bind(store);
        } else {
            var property = definition[name];

            if (typeof property !== "function" || !definition.hasOwnProperty(name)) {
                continue;
            }

            store[name] = property.bind(store);
        }
    }

    return store;
};
},{}],9:[function(require,module,exports){
"use strict";

var _ = require("./utils"),
    ActionMethods = require("./ActionMethods"),
    PublisherMethods = require("./PublisherMethods"),
    Keep = require("./Keep");

var allowed = { preEmit: 1, shouldEmit: 1 };

/**
 * Creates an action functor object. It is mixed in with functions
 * from the `PublisherMethods` mixin. `preEmit` and `shouldEmit` may
 * be overridden in the definition object.
 *
 * @param {Object} definition The action object definition
 */
var createAction = function createAction(definition) {

    definition = definition || {};
    if (!_.isObject(definition)) {
        definition = { actionName: definition };
    }

    for (var a in ActionMethods) {
        if (!allowed[a] && PublisherMethods[a]) {
            throw new Error("Cannot override API method " + a + " in Reflux.ActionMethods. Use another method name or override it on Reflux.PublisherMethods instead.");
        }
    }

    for (var d in definition) {
        if (!allowed[d] && PublisherMethods[d]) {
            throw new Error("Cannot override API method " + d + " in action creation. Use another method name or override it on Reflux.PublisherMethods instead.");
        }
    }

    definition.children = definition.children || [];
    if (definition.asyncResult) {
        definition.children = definition.children.concat(["completed", "failed"]);
    }

    var i = 0,
        childActions = {};
    for (; i < definition.children.length; i++) {
        var name = definition.children[i];
        childActions[name] = createAction(name);
    }

    var context = _.extend({
        eventLabel: "action",
        emitter: new _.EventEmitter(),
        _isAction: true
    }, PublisherMethods, ActionMethods, definition);

    var functor = function functor() {
        var triggerType = functor.sync ? "trigger" : "triggerAsync";
        return functor[triggerType].apply(functor, arguments);
    };

    _.extend(functor, childActions, context);

    Keep.createdActions.push(functor);

    return functor;
};

module.exports = createAction;
},{"./ActionMethods":3,"./Keep":4,"./PublisherMethods":6,"./utils":14}],10:[function(require,module,exports){
"use strict";

var _ = require("./utils"),
    Keep = require("./Keep"),
    mixer = require("./mixer"),
    bindMethods = require("./bindMethods");

var allowed = { preEmit: 1, shouldEmit: 1 };

/**
 * Creates an event emitting Data Store. It is mixed in with functions
 * from the `ListenerMethods` and `PublisherMethods` mixins. `preEmit`
 * and `shouldEmit` may be overridden in the definition object.
 *
 * @param {Object} definition The data store object definition
 * @returns {Store} A data store instance
 */
module.exports = function (definition) {

    var StoreMethods = require("./StoreMethods"),
        PublisherMethods = require("./PublisherMethods"),
        ListenerMethods = require("./ListenerMethods");

    definition = definition || {};

    for (var a in StoreMethods) {
        if (!allowed[a] && (PublisherMethods[a] || ListenerMethods[a])) {
            throw new Error("Cannot override API method " + a + " in Reflux.StoreMethods. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead.");
        }
    }

    for (var d in definition) {
        if (!allowed[d] && (PublisherMethods[d] || ListenerMethods[d])) {
            throw new Error("Cannot override API method " + d + " in store creation. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead.");
        }
    }

    definition = mixer(definition);

    function Store() {
        var i = 0,
            arr;
        this.subscriptions = [];
        this.emitter = new _.EventEmitter();
        this.eventLabel = "change";
        bindMethods(this, definition);
        if (this.init && _.isFunction(this.init)) {
            this.init();
        }
        if (this.listenables) {
            arr = [].concat(this.listenables);
            for (; i < arr.length; i++) {
                this.listenToMany(arr[i]);
            }
        }
    }

    _.extend(Store.prototype, ListenerMethods, PublisherMethods, StoreMethods, definition);

    var store = new Store();
    Keep.createdStores.push(store);

    return store;
};
},{"./Keep":4,"./ListenerMethods":5,"./PublisherMethods":6,"./StoreMethods":7,"./bindMethods":8,"./mixer":13,"./utils":14}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Reflux = {
    version: {
        "reflux-core": "0.3.0"
    }
};

Reflux.ActionMethods = require("./ActionMethods");

Reflux.ListenerMethods = require("./ListenerMethods");

Reflux.PublisherMethods = require("./PublisherMethods");

Reflux.StoreMethods = require("./StoreMethods");

Reflux.createAction = require("./createAction");

Reflux.createStore = require("./createStore");

var maker = require("./joins").staticJoinCreator;

Reflux.joinTrailing = Reflux.all = maker("last"); // Reflux.all alias for backward compatibility

Reflux.joinLeading = maker("first");

Reflux.joinStrict = maker("strict");

Reflux.joinConcat = maker("all");

var _ = Reflux.utils = require("./utils");

Reflux.EventEmitter = _.EventEmitter;

Reflux.Promise = _.Promise;

/**
 * Convenience function for creating a set of actions
 *
 * @param definitions the definitions for the actions to be created
 * @returns an object with actions of corresponding action names
 */
Reflux.createActions = (function () {
    var reducer = function reducer(definitions, actions) {
        Object.keys(definitions).forEach(function (actionName) {
            var val = definitions[actionName];
            actions[actionName] = Reflux.createAction(val);
        });
    };

    return function (definitions) {
        var actions = {};
        if (definitions instanceof Array) {
            definitions.forEach(function (val) {
                if (_.isObject(val)) {
                    reducer(val, actions);
                } else {
                    actions[val] = Reflux.createAction(val);
                }
            });
        } else {
            reducer(definitions, actions);
        }
        return actions;
    };
})();

/**
 * Sets the eventmitter that Reflux uses
 */
Reflux.setEventEmitter = function (ctx) {
    Reflux.EventEmitter = _.EventEmitter = ctx;
};

/**
 * Sets the method used for deferring actions and stores
 */
Reflux.nextTick = function (nextTick) {
    _.nextTick = nextTick;
};

Reflux.use = function (pluginCb) {
    pluginCb(Reflux);
};

/**
 * Provides the set of created actions and stores for introspection
 */
/*eslint-disable no-underscore-dangle*/
Reflux.__keep = require("./Keep");
/*eslint-enable no-underscore-dangle*/

/**
 * Warn if Function.prototype.bind not available
 */
if (!Function.prototype.bind) {
    console.error("Function.prototype.bind not available. " + "ES5 shim required. " + "https://github.com/spoike/refluxjs#es5");
}

exports["default"] = Reflux;
module.exports = exports["default"];
},{"./ActionMethods":3,"./Keep":4,"./ListenerMethods":5,"./PublisherMethods":6,"./StoreMethods":7,"./createAction":9,"./createStore":10,"./joins":12,"./utils":14}],12:[function(require,module,exports){
/**
 * Internal module used to create static and instance join methods
 */

"use strict";

var createStore = require("./createStore"),
    _ = require("./utils");

var slice = Array.prototype.slice,
    strategyMethodNames = {
    strict: "joinStrict",
    first: "joinLeading",
    last: "joinTrailing",
    all: "joinConcat"
};

/**
 * Used in `index.js` to create the static join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} A static function which returns a store with a join listen on the given listenables using the given strategy
 */
exports.staticJoinCreator = function (strategy) {
    return function () /* listenables... */{
        var listenables = slice.call(arguments);
        return createStore({
            init: function init() {
                this[strategyMethodNames[strategy]].apply(this, listenables.concat("triggerAsync"));
            }
        });
    };
};

/**
 * Used in `ListenerMethods.js` to create the instance join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} An instance method which sets up a join listen on the given listenables using the given strategy
 */
exports.instanceJoinCreator = function (strategy) {
    return function () /* listenables..., callback*/{
        _.throwIf(arguments.length < 2, "Cannot create a join with less than 2 listenables!");
        var listenables = slice.call(arguments),
            callback = listenables.pop(),
            numberOfListenables = listenables.length,
            join = {
            numberOfListenables: numberOfListenables,
            callback: this[callback] || callback,
            listener: this,
            strategy: strategy
        },
            i,
            cancels = [],
            subobj;
        for (i = 0; i < numberOfListenables; i++) {
            _.throwIf(this.validateListening(listenables[i]));
        }
        for (i = 0; i < numberOfListenables; i++) {
            cancels.push(listenables[i].listen(newListener(i, join), this));
        }
        reset(join);
        subobj = { listenable: listenables };
        subobj.stop = makeStopper(subobj, cancels, this);
        this.subscriptions = (this.subscriptions || []).concat(subobj);
        return subobj;
    };
};

// ---- internal join functions ----

function makeStopper(subobj, cancels, context) {
    return function () {
        var i,
            subs = context.subscriptions,
            index = subs ? subs.indexOf(subobj) : -1;
        _.throwIf(index === -1, "Tried to remove join already gone from subscriptions list!");
        for (i = 0; i < cancels.length; i++) {
            cancels[i]();
        }
        subs.splice(index, 1);
    };
}

function reset(join) {
    join.listenablesEmitted = new Array(join.numberOfListenables);
    join.args = new Array(join.numberOfListenables);
}

function newListener(i, join) {
    return function () {
        var callargs = slice.call(arguments);
        if (join.listenablesEmitted[i]) {
            switch (join.strategy) {
                case "strict":
                    throw new Error("Strict join failed because listener triggered twice.");
                case "last":
                    join.args[i] = callargs;break;
                case "all":
                    join.args[i].push(callargs);
            }
        } else {
            join.listenablesEmitted[i] = true;
            join.args[i] = join.strategy === "all" ? [callargs] : callargs;
        }
        emitIfAllListenablesEmitted(join);
    };
}

function emitIfAllListenablesEmitted(join) {
    for (var i = 0; i < join.numberOfListenables; i++) {
        if (!join.listenablesEmitted[i]) {
            return;
        }
    }
    join.callback.apply(join.listener, join.args);
    reset(join);
}
},{"./createStore":10,"./utils":14}],13:[function(require,module,exports){
"use strict";

var _ = require("./utils");

module.exports = function mix(def) {
    var composed = {
        init: [],
        preEmit: [],
        shouldEmit: []
    };

    var updated = (function mixDef(mixin) {
        var mixed = {};
        if (mixin.mixins) {
            mixin.mixins.forEach(function (subMixin) {
                _.extend(mixed, mixDef(subMixin));
            });
        }
        _.extend(mixed, mixin);
        Object.keys(composed).forEach(function (composable) {
            if (mixin.hasOwnProperty(composable)) {
                composed[composable].push(mixin[composable]);
            }
        });
        return mixed;
    })(def);

    if (composed.init.length > 1) {
        updated.init = function () {
            var args = arguments;
            composed.init.forEach(function (init) {
                init.apply(this, args);
            }, this);
        };
    }
    if (composed.preEmit.length > 1) {
        updated.preEmit = function () {
            return composed.preEmit.reduce((function (args, preEmit) {
                var newValue = preEmit.apply(this, args);
                return newValue === undefined ? args : [newValue];
            }).bind(this), arguments);
        };
    }
    if (composed.shouldEmit.length > 1) {
        updated.shouldEmit = function () {
            var args = arguments;
            return !composed.shouldEmit.some(function (shouldEmit) {
                return !shouldEmit.apply(this, args);
            }, this);
        };
    }
    Object.keys(composed).forEach(function (composable) {
        if (composed[composable].length === 1) {
            updated[composable] = composed[composable][0];
        }
    });

    return updated;
};
},{"./utils":14}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.capitalize = capitalize;
exports.callbackName = callbackName;
exports.isObject = isObject;
exports.extend = extend;
exports.isFunction = isFunction;
exports.object = object;
exports.isArguments = isArguments;
exports.throwIf = throwIf;

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function callbackName(string, prefix) {
    prefix = prefix || "on";
    return prefix + exports.capitalize(string);
}

/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */

function isObject(obj) {
    var type = typeof obj;
    return type === "function" || type === "object" && !!obj;
}

function extend(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
                var propertyDescriptor = Object.getOwnPropertyDescriptor(source, prop);
                Object.defineProperty(obj, prop, propertyDescriptor);
            } else {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
}

function isFunction(value) {
    return typeof value === "function";
}

exports.EventEmitter = require("eventemitter3");

exports.nextTick = function (callback) {
    setTimeout(callback, 0);
};

function object(keys, vals) {
    var o = {},
        i = 0;
    for (; i < keys.length; i++) {
        o[keys[i]] = vals[i];
    }
    return o;
}

function isArguments(value) {
    return typeof value === "object" && "callee" in value && typeof value.length === "number";
}

function throwIf(val, msg) {
    if (val) {
        throw Error(msg || val);
    }
}
},{"eventemitter3":2}],15:[function(require,module,exports){
var _ = require('reflux-core/lib/utils'),
    ListenerMethods = require('reflux-core/lib/ListenerMethods');

/**
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from
 * `ListenerMethods` mixin and takes care of teardown of subscriptions.
 * Note that if you're using the `connect` mixin you don't need this mixin, as connect will
 * import everything this mixin contains!
 */
module.exports = _.extend({

    /**
     * Cleans up all listener previously registered.
     */
    componentWillUnmount: ListenerMethods.stopListeningToAll

}, ListenerMethods);

},{"reflux-core/lib/ListenerMethods":5,"reflux-core/lib/utils":14}],16:[function(require,module,exports){
var ListenerMethods = require('reflux-core/lib/ListenerMethods'),
    ListenerMixin = require('./ListenerMixin'),
    _ = require('reflux-core/lib/utils');

module.exports = function(listenable, key) {

    _.throwIf(typeof(key) === 'undefined', 'Reflux.connect() requires a key.');

    return {
        getInitialState: function() {
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            }

            return _.object([key],[listenable.getInitialState()]);
        },
        componentDidMount: function() {
            var me = this;

            _.extend(me, ListenerMethods);

            this.listenTo(listenable, function(v) {
                me.setState(_.object([key],[v]));
            });
        },
        componentWillUnmount: ListenerMixin.componentWillUnmount
    };
};

},{"./ListenerMixin":15,"reflux-core/lib/ListenerMethods":5,"reflux-core/lib/utils":14}],17:[function(require,module,exports){
var ListenerMethods = require('reflux-core/lib/ListenerMethods'),
    ListenerMixin = require('./ListenerMixin'),
    _ = require('reflux-core/lib/utils');

module.exports = function(listenable, key, filterFunc) {

    _.throwIf(_.isFunction(key), 'Reflux.connectFilter() requires a key.');

    return {
        getInitialState: function() {
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            }

            // Filter initial payload from store.
            var result = filterFunc.call(this, listenable.getInitialState());
            if (typeof(result) !== 'undefined') {
                return _.object([key], [result]);
            } else {
                return {};
            }
        },
        componentDidMount: function() {
            var me = this;

            _.extend(this, ListenerMethods);

            this.listenTo(listenable, function(value) {
                var result = filterFunc.call(me, value);
                me.setState(_.object([key], [result]));
            });
        },
        componentWillUnmount: ListenerMixin.componentWillUnmount
    };
};

},{"./ListenerMixin":15,"reflux-core/lib/ListenerMethods":5,"reflux-core/lib/utils":14}],18:[function(require,module,exports){
var Reflux = require('reflux-core');

Reflux.connect = require('./connect');

Reflux.connectFilter = require('./connectFilter');

Reflux.ListenerMixin = require('./ListenerMixin');

Reflux.listenTo = require('./listenTo');

Reflux.listenToMany = require('./listenToMany');

module.exports = Reflux;

},{"./ListenerMixin":15,"./connect":16,"./connectFilter":17,"./listenTo":19,"./listenToMany":20,"reflux-core":11}],19:[function(require,module,exports){
var ListenerMethods = require('reflux-core/lib/ListenerMethods');

/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `ListenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method.
 *
 * @param {Action|Store} listenable An Action or Store that should be
 *  listened to.
 * @param {Function|String} callback The callback to register as event handler
 * @param {Function|String} defaultCallback The callback to register as default handler
 * @returns {Object} An object to be used as a mixin, which sets up the listener for the given listenable.
 */
module.exports = function(listenable,callback,initial){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            for(var m in ListenerMethods){
                if (this[m] !== ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";
                    }
                    this[m] = ListenerMethods[m];
                }
            }
            this.listenTo(listenable,callback,initial);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: ListenerMethods.stopListeningToAll
    };
};

},{"reflux-core/lib/ListenerMethods":5}],20:[function(require,module,exports){
var ListenerMethods = require('reflux-core/lib/ListenerMethods');

/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `listenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method. This version is used
 * to automatically set up a `listenToMany` call.
 *
 * @param {Object} listenables An object of listenables
 * @returns {Object} An object to be used as a mixin, which sets up the listeners for the given listenables.
 */
module.exports = function(listenables){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            for(var m in ListenerMethods){
                if (this[m] !== ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenToMany!";
                    }
                    this[m] = ListenerMethods[m];
                }
            }
            this.listenToMany(listenables);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: ListenerMethods.stopListeningToAll
    };
};

},{"reflux-core/lib/ListenerMethods":5}],21:[function(require,module,exports){
var Reflux = require('reflux');

module.exports = Reflux.createActions([
  'removeItem',
]);


},{"reflux":18}],22:[function(require,module,exports){
/**
 * ASU Department Picker Component
 */
var $ = jQuery;
var Reflux = require('reflux');
var DeptListStore = require('../stores/dept-list-store');


var DeptTree = require('./dept-tree.jsx');
var DeptList = require('./dept-list.jsx');


module.exports = React.createClass({displayName: "exports",
  mixins: [
    Reflux.listenTo(DeptListStore, 'onDeptListItemChange')
  ],

  onDeptListItemChange: function(event, item) {
    switch (event) {
      case 'removeItem': this.handleRemoveItem(item);
    }
  },

  getInitialState: function() {
    return {
      config: {items: [], options: {}},
      selectedDepartments: [],
      currentNode: null,
      includeSubdepts: false,
      instance_id: Math.random()
    };
  },

  componentWillMount: function() {
    // Escape support
    $(document).on('keyup', function(e) {
      if (e.keyCode == 27) {
        if ($('.asu-dept-picker-modal').has('dialog-open')) {
          $('.asu-dept-picker-modal').removeClass('dialog-open');
          e.preventDefault();
          return false;
        }
      }
    });
  },

  componentDidMount: function() {
    console.log(this);
  },

  render: function() {
    return React.createElement("div", {className: "widget-asu-dept-picker"}, 
      this.renderBrowseButton(), 
      this.renderDepartmentList(), 
      this.renderModal()
    )
  },

  renderModal: function() {
    return React.createElement("div", {ref: "modal", className: "asu-dept-picker-modal"}, 
      React.createElement("div", {className: "dialog"}, 
        React.createElement("div", {className: "dialog-title"}, 
          this.props.title || "Select Department", 
          React.createElement("div", {className: "close-dialog", onClick: this.handleCancelClick}, 
            React.createElement("span", {className: "fa fa-close"})
          )
        ), 
        React.createElement(DeptTree, React.__spread({ref: "deptTree"},  this.props, 
          {onTreeClick: this.handleDeptTreeClick})
        ), 
        React.createElement("div", {className: "actions"}, 
          React.createElement("div", {className: "form-item form-type-checkbox"}, 
            React.createElement("input", {
              ref: "include_subdept", 
              type: "checkbox", 
              className: "form-checkbox", 
              onClick: this.handleSubdeptClick, 
              defaultChecked: this.state.includeSubdepts ? 'checked' : ''}
            ), 
            React.createElement("label", {className: "option", onClick: this.handleLabelClick}, " Include sub-departments?"), 
            React.createElement("div", {className: "description", style: {'display': 'none'}}, 
              "This will include all sub-departments beneath the selected department."
            )
          ), 
          React.createElement("input", {type: "button", 
            className: "form-submit", 
            onClick: this.handleSubmitClick, 
            value: "Submit"}
          ), 
          React.createElement("input", {type: "button", 
            className: "form-submit", 
            onClick: this.handleCancelClick, 
            value: "Cancel"}
          )
        )
      )
    )
  },

  renderDepartmentList: function() {
    return React.createElement(DeptList, {ref: "deptList", items: this.state.selectedDepartments})
  },

  renderBrowseButton: function() {
    return React.createElement("div", {className: "browse-button"}, 
      React.createElement("input", {type: "button", 
        value: "Browse", 
        className: "form-submit", 
        onClick: this.handleBrowseClick}
      )
    )
  },

  handleRemoveItem: function(item) {
    // filter out the item
    console.log('removing item! ' + this.state.instance_id);
  },

  handleSubdeptClick: function() {
    this.setState({ includeSubdepts: !this.state.includeSubdepts });
  },

  handleLabelClick: function() {
    $(this.refs.include_subdept).trigger('click');
  },

  handleCancelClick: function() {
    this.closeModal();
  },

  handleSubmitClick: function() {
    // setup config
    this.setDeptConfig(this.refs.deptTree.state.currentNode);
    // update selected departments list
    this.setSelectedDepartments();
    // close the modal
    this.closeModal();
  },

  handleBrowseClick: function(event) {
    this.openModal();
  },

  handleDeptTreeClick: function(data) {
    this.setState({ currentNode: data.node });
  },

  openModal: function() {
    $(this.refs.modal).addClass('dialog-open');
  },

  closeModal: function() {
    $(this.refs.modal).removeClass('dialog-open');
  },

  setSelectedDepartments: function() {
    var deptTree = this.refs.deptTree;
    var config = this.state.config;
    var depts = [];

    $.each(config.items, function(index, item) {
      depts.push({
        id: item.dept_id,
        title: deptTree.getDeptPath(item.tid)
      });
    });

    this.setState({ selectedDepartments: depts });
  },

  setDeptConfig: function(data) {
    // get the tree path to set the label
    var config = this.state.config;

    var unique = true;
    $.each(config.items, function(index, item) {
      if (item.dept_nid == data.dept_nid) {
        unique = false;
        // update configuration
        config.options[item.dept_id].subdepts = this.state.includeSubdepts;
      }
    }.bind(this));

    if (unique) {
      config.items.push({
        'dept_id': data.dept_id,
        'dept_nid': data.dept_nid,
        'tree_nids': data.tree_nids,
        'tid': data.tid
      });

      config.options[data.dept_id] = {
        subdepts: this.state.includeSubdepts
      };
    }

    this.setState({ config: config });
  }
});


},{"../stores/dept-list-store":26,"./dept-list.jsx":24,"./dept-tree.jsx":25,"reflux":18}],23:[function(require,module,exports){
/**
 * ASU Department List Item Component
 */
var $ = jQuery;

var Reflux = require('reflux');
var Actions = require('../actions/dept-list-item-actions');

module.exports = React.createClass({displayName: "exports",

  componentDidMount: function() {
    console.log(this);
  },

  getInitialState: function() {
    return {
      id: this.props.id
    }
  },

  handleItemRemove: function(event) {
    Actions.removeItem(this);
  },

  render: function() {
    return React.createElement("li", {ref: "dept"}, 
      this.props.title, 
      React.createElement("span", {className: "tag remove"}, 
        React.createElement("span", {onClick: this.handleItemRemove, className: "fa fa-close"})
      )
    )
  }
});


},{"../actions/dept-list-item-actions":21,"reflux":18}],24:[function(require,module,exports){
/**
 * ASU Department Picker Component
 */
var DeptListItem = require('./dept-list-item');

module.exports = React.createClass({displayName: "exports",
  getInitialState: function() {
    return {
      items: this.props.items || []
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({ items: nextProps.items });
  },

  render: function() {
    return React.createElement("ul", {className: "asu-dept-list"}, 
      this.renderList()
    )
  },

  renderList: function() {
    return this.state.items.map(function(item) {
      return React.createElement(DeptListItem, {key: item.id, id: item.id, title: item.title})
    });
  },
});


},{"./dept-list-item":23}],25:[function(require,module,exports){
var $ = jQuery;

/**
 * Department Tree Component
 */
module.exports = React.createClass({displayName: "exports",
  getInitialState: function() {
    return {
      treeData: JSON.parse(this.props.tree_json_data),
      currentNode: {
        dept_id: 1234,
      }
    }
  },
  componentDidMount: function() {
    // initialize tree plugin...
    var el = this.refs.treeWidget;
    var tree_data = this.state.treeData;
    var topLevel = 10;

    var defaults = {
      openAt: 1,
      showOnly: null,
      autoOpen: 0
    };
    options = $.extend(defaults, this.props);

    $(el).tree({
      data: tree_data,
      closedIcon: $('<span class="fa fa-plus-circle"></span>'),
      openedIcon: $('<span class="fa fa-minus-circle"></span>'),

      // First level open
      autoOpen: options.autoOpen,
      selectable: true,

      // Assign dept_id attribute to each tree <li>
      onCreateLi: function (node, $li) {
        $li.attr('dept_nid', node.dept_nid);
        $li.attr('dept_id', node.dept_id);

        if (options.showOnly && Array.isArray(options.showOnly) && options.showOnly.length) {
          $(el).addClass('trimmed');

          $.each(options.showOnly, function(index, item){
            if (item == node.dept_nid || node.dept_id == 'ASU') {
              $li.addClass('visible');
            }
          });
        }

        if (!node.hasChildren()) {
          $li.find('.jqtree-element').prepend('<span class="jqtree-folder-icon fa fa-bookmark"></span>');
        }
      }
    });

    $(el).bind('tree.click', this.onTreeClick);
  },
  render: function() {
    return React.createElement("div", {className: "asu-dept-tree"}, 
      React.createElement("div", {className: "tree-wrapper", ref: "treeWidget"}, "Tree widget")
    )
  },
  onTreeClick: function(event) {
    event.node.tree_nids = this.getTreeIds(event.node);
    this.setState({ currentNode: event.node });
    this.props.onTreeClick(event);
  },
  getDeptPath: function(dept_tid, path, reverse) {
    switch (arguments.length) {
      case 1: path = [];
      case 2: reverse = true;
    }

    if (item = this.findRootDept(dept_tid, 'tid')) {

      var className = ['fragment'];

      if (item.parents[0] == '0') {
        // abbreviate Arizona State University
        item.name = 'ASU';
        className.push('first');
      }
      if (item.children.length == 0) {
        className.push('last');
      }

      path.push(React.createElement("span", {key: dept_tid, className: className.join(' ')}, item.name));
      if (item.parents.length) {
        path = this.getDeptPath(item.parents[0], path, false);
      }
    }

    if (reverse) {
      path = path.reverse();
    }

    return path;
  },
  getTreeIds: function(tree, tree_ids) {
    if (arguments.length == 1) {
      tree_ids = [];
    }

    tree_ids.push(tree.dept_nid);

    for (var i = 0; i < tree.children.length; i++) {
      this.getTreeIds(tree.children[i], tree_ids);
    }

    return tree_ids;
  },
  findRootDept: function(dept_id, id_type, data) {
    var dept = null;

    switch(arguments.length) {
      case 1:
        id_type = 'dept_nid';
      case 2:
        data = this.state.treeData;
        break;
    }

    if (arguments.length == 1) {
      id_type = 'dept_nid';
    }

    for (var i = 0; i < data.length; i++) {
      if (dept == null && data[i] != null) {
        if (data[i][id_type] == dept_id) {
          return data[i];
        }
        else if (data[i].hasOwnProperty('children')) {
          dept = this.findRootDept(dept_id, id_type, data[i].children);
        }
      }
      else {
        break;
      }
    }
    return dept;
  }
});

/**
 * Saves the ids of all departments under currently selected tree on #people's data object
 * @param {object}
 *  Nested JSON object with department data
 */
function asu_isearch_dept_get_tree_ids(tree, tree_ids) {

  if (arguments.length == 1) {
    tree_ids = [];
  }

  tree_ids.push(tree.dept_nid);

  for (var i = 0; i < tree.children.length; i++) {
    asu_isearch_dept_get_tree_ids(tree.children[i], tree_ids);
  }

  return tree_ids;
}

function asu_isearch_dept_get_tree_path_ids(tree, dept_nid, tree_path) {
  
  if (arguments.length == 2) {
    var tree_path = [];
  }

  if (item = asu_isearch_dept_find_root(tree, dept_nid, 'dept_nid')) {
    tree_path.push(item.dept_nid);
    if (item.parents.length) {
      var tree_item = asu_isearch_dept_find_root(tree, item.parents[0], 'tid');
      if (tree_item) {
        asu_isearch_dept_get_tree_path_ids(tree, tree_item.dept_nid, tree_path);
      }
    }
  }

  return tree_path;
}

},{}],26:[function(require,module,exports){
/**
 * Department List Data Store
 */
var Reflux = require('reflux');
var DeptListItemActions = require('../actions/dept-list-item-actions');

module.exports = Reflux.createStore({
  listenables: [DeptListItemActions],

  removeItem: function(item) {
    this.trigger('removeItem', item);
  }

});


},{"../actions/dept-list-item-actions":21,"reflux":18}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2ViYXN0aWFuL3d3dy9hc3VfZGVwdF9waWNrZXIvc3JjL21haW4uanN4Iiwibm9kZV9tb2R1bGVzL2V2ZW50ZW1pdHRlcjMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL0FjdGlvbk1ldGhvZHMuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL0tlZXAuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL0xpc3RlbmVyTWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgtY29yZS9saWIvUHVibGlzaGVyTWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgtY29yZS9saWIvU3RvcmVNZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9iaW5kTWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgtY29yZS9saWIvY3JlYXRlQWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9jcmVhdGVTdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgtY29yZS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL2pvaW5zLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9taXhlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgtY29yZS9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L3NyYy9MaXN0ZW5lck1peGluLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9zcmMvY29ubmVjdC5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvc3JjL2Nvbm5lY3RGaWx0ZXIuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L3NyYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvc3JjL2xpc3RlblRvLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9zcmMvbGlzdGVuVG9NYW55LmpzIiwiL1VzZXJzL3NlYmFzdGlhbi93d3cvYXN1X2RlcHRfcGlja2VyL3NyYy9hY3Rpb25zL2RlcHQtbGlzdC1pdGVtLWFjdGlvbnMuanN4IiwiL1VzZXJzL3NlYmFzdGlhbi93d3cvYXN1X2RlcHRfcGlja2VyL3NyYy9jb21wb25lbnRzL2FzdS1kZXB0LXBpY2tlci5qc3giLCIvVXNlcnMvc2ViYXN0aWFuL3d3dy9hc3VfZGVwdF9waWNrZXIvc3JjL2NvbXBvbmVudHMvZGVwdC1saXN0LWl0ZW0uanN4IiwiL1VzZXJzL3NlYmFzdGlhbi93d3cvYXN1X2RlcHRfcGlja2VyL3NyYy9jb21wb25lbnRzL2RlcHQtbGlzdC5qc3giLCIvVXNlcnMvc2ViYXN0aWFuL3d3dy9hc3VfZGVwdF9waWNrZXIvc3JjL2NvbXBvbmVudHMvZGVwdC10cmVlLmpzeCIsIi9Vc2Vycy9zZWJhc3RpYW4vd3d3L2FzdV9kZXB0X3BpY2tlci9zcmMvc3RvcmVzL2RlcHQtbGlzdC1zdG9yZS5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7R0FFRztBQUNILElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDOztBQUVoRTs7R0FFRztBQUNILENBQUMsVUFBVSxDQUFDLEVBQUU7RUFDWixNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBRztBQUNyQyxJQUFJLE1BQU0sRUFBRSxTQUFTLE9BQU8sRUFBRSxRQUFRLEVBQUU7O01BRWxDLENBQUMsQ0FBQyxzQ0FBc0MsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVztRQUNqRSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQy9DLFFBQVEsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7UUFFN0MsSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDeEMsQ0FBQyxDQUFDO0tBQ0o7R0FDRjtDQUNGLEVBQUUsTUFBTSxDQUFDLENBQUM7Ozs7QUN4Qlg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtNQUN2QixJQUFJLFNBQVMsR0FBRywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztNQUN6RSxJQUFJLFNBQVMsRUFBRTtRQUNiLGtDQUFrQyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO09BQ3pFO0tBQ0Y7QUFDTCxHQUFHOztFQUVELE9BQU8sU0FBUyxDQUFDOzs7O0FDckxuQjs7R0FFRztBQUNILElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQixJQUFJLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDOztBQUV2RSxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDcEMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQzs7RUFFbEMsVUFBVSxFQUFFLFNBQVMsSUFBSSxFQUFFO0lBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLEdBQUc7O0NBRUYsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGZpbGVcbiAqIEphdmFzY3JpcHQgZm9yIEFTVSBEZXB0IFBpY2tlclxuICpcbiAqIFJlcXVpcmVzIFJlYWN0L1JlYWN0RE9NXG4gKi9cbnZhciBBc3VEZXB0UGlja2VyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2FzdS1kZXB0LXBpY2tlci5qc3gnKTtcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBBU1UgZGVwYXJ0bWVudCBwaWNrZXIgd2lkZ2V0LlxuICovXG4oZnVuY3Rpb24gKCQpIHtcbiAgRHJ1cGFsLmJlaGF2aW9ycy5hc3VfZGVwdF9waWNrZXIgPSB7XG4gICAgYXR0YWNoOiBmdW5jdGlvbihjb250ZXh0LCBzZXR0aW5ncykge1xuICAgICAgLy8gc2V0dXAgYW55IGFzdS1kZXB0LXBpY2tlciBmaWVsZHNcbiAgICAgICQoJy5hc3UtZGVwdC1waWNrZXI6bm90KFtkYXRhLXJlYWN0aWRdKScsIGNvbnRleHQpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkZWx0YSA9ICQodGhpcykuYXR0cignZGF0YS1kZWx0YScpO1xuICAgICAgICB2YXIgY29uZmlnID0gc2V0dGluZ3MuYXN1X2RlcHRfcGlja2VyW2RlbHRhXTtcblxuICAgICAgICB2YXIgYXN1X2RlcHRfcGlja2VyID0gUmVhY3QuY3JlYXRlRWxlbWVudChBc3VEZXB0UGlja2VyLCBjb25maWcpO1xuICAgICAgICBSZWFjdERPTS5yZW5kZXIoYXN1X2RlcHRfcGlja2VyLCB0aGlzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8vXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy8gV2UgYWxzbyBhc3N1bWUgdGhhdCBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIGV2ZW50IG5hbWVcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXG4vL1xudmFyIHByZWZpeCA9IHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSAnZnVuY3Rpb24nID8gJ34nIDogZmFsc2U7XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvbmNlPWZhbHNlXSBPbmx5IGVtaXQgb25jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxuXG4vKipcbiAqIEhvbGQgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybiBhbiBhcnJheSBsaXN0aW5nIHRoZSBldmVudHMgZm9yIHdoaWNoIHRoZSBlbWl0dGVyIGhhcyByZWdpc3RlcmVkXG4gKiBsaXN0ZW5lcnMuXG4gKlxuICogQHJldHVybnMge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1xuICAgICwgbmFtZXMgPSBbXVxuICAgICwgbmFtZTtcblxuICBpZiAoIWV2ZW50cykgcmV0dXJuIG5hbWVzO1xuXG4gIGZvciAobmFtZSBpbiBldmVudHMpIHtcbiAgICBpZiAoaGFzLmNhbGwoZXZlbnRzLCBuYW1lKSkgbmFtZXMucHVzaChwcmVmaXggPyBuYW1lLnNsaWNlKDEpIDogbmFtZSk7XG4gIH1cblxuICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuICAgIHJldHVybiBuYW1lcy5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhldmVudHMpKTtcbiAgfVxuXG4gIHJldHVybiBuYW1lcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgICAsIGo7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IFtjb250ZXh0PXRoaXNdIFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gW2NvbnRleHQ9dGhpc10gVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGV2ZW50cyA9IFtdO1xuXG4gIGlmIChmbikge1xuICAgIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICAgIGlmIChcbiAgICAgICAgICAgbGlzdGVuZXJzLmZuICE9PSBmblxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpXG4gICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVycy5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgKSB7XG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVycyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cbiAgICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXG4gICAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICAgICkge1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gIC8vXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fZXZlbnRzW2V2dF0gPSBldmVudHMubGVuZ3RoID09PSAxID8gZXZlbnRzWzBdIDogZXZlbnRzO1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcblxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudF07XG4gIGVsc2UgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBwcmVmaXguXG4vL1xuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuIiwiLyoqXG4gKiBBIG1vZHVsZSBvZiBtZXRob2RzIHRoYXQgeW91IHdhbnQgdG8gaW5jbHVkZSBpbiBhbGwgYWN0aW9ucy5cbiAqIFRoaXMgbW9kdWxlIGlzIGNvbnN1bWVkIGJ5IGBjcmVhdGVBY3Rpb25gLlxuICovXG5cInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSB7fTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5jcmVhdGVkU3RvcmVzID0gW107XG5cbmV4cG9ydHMuY3JlYXRlZEFjdGlvbnMgPSBbXTtcblxuZXhwb3J0cy5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB3aGlsZSAoZXhwb3J0cy5jcmVhdGVkU3RvcmVzLmxlbmd0aCkge1xuICAgICAgICBleHBvcnRzLmNyZWF0ZWRTdG9yZXMucG9wKCk7XG4gICAgfVxuICAgIHdoaWxlIChleHBvcnRzLmNyZWF0ZWRBY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICBleHBvcnRzLmNyZWF0ZWRBY3Rpb25zLnBvcCgpO1xuICAgIH1cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4vdXRpbHNcIiksXG4gICAgbWFrZXIgPSByZXF1aXJlKFwiLi9qb2luc1wiKS5pbnN0YW5jZUpvaW5DcmVhdG9yO1xuXG4vKipcbiAqIEV4dHJhY3QgY2hpbGQgbGlzdGVuYWJsZXMgZnJvbSBhIHBhcmVudCBmcm9tIHRoZWlyXG4gKiBjaGlsZHJlbiBwcm9wZXJ0eSBhbmQgcmV0dXJuIHRoZW0gaW4gYSBrZXllZCBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbGlzdGVuYWJsZSBUaGUgcGFyZW50IGxpc3RlbmFibGVcbiAqL1xudmFyIG1hcENoaWxkTGlzdGVuYWJsZXMgPSBmdW5jdGlvbiBtYXBDaGlsZExpc3RlbmFibGVzKGxpc3RlbmFibGUpIHtcbiAgICB2YXIgaSA9IDAsXG4gICAgICAgIGNoaWxkcmVuID0ge30sXG4gICAgICAgIGNoaWxkTmFtZTtcbiAgICBmb3IgKDsgaSA8IChsaXN0ZW5hYmxlLmNoaWxkcmVuIHx8IFtdKS5sZW5ndGg7ICsraSkge1xuICAgICAgICBjaGlsZE5hbWUgPSBsaXN0ZW5hYmxlLmNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAobGlzdGVuYWJsZVtjaGlsZE5hbWVdKSB7XG4gICAgICAgICAgICBjaGlsZHJlbltjaGlsZE5hbWVdID0gbGlzdGVuYWJsZVtjaGlsZE5hbWVdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjaGlsZHJlbjtcbn07XG5cbi8qKlxuICogTWFrZSBhIGZsYXQgZGljdGlvbmFyeSBvZiBhbGwgbGlzdGVuYWJsZXMgaW5jbHVkaW5nIHRoZWlyXG4gKiBwb3NzaWJsZSBjaGlsZHJlbiAocmVjdXJzaXZlbHkpLCBjb25jYXRlbmF0aW5nIG5hbWVzIGluIGNhbWVsQ2FzZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbGlzdGVuYWJsZXMgVGhlIHRvcC1sZXZlbCBsaXN0ZW5hYmxlc1xuICovXG52YXIgZmxhdHRlbkxpc3RlbmFibGVzID0gZnVuY3Rpb24gZmxhdHRlbkxpc3RlbmFibGVzKGxpc3RlbmFibGVzKSB7XG4gICAgdmFyIGZsYXR0ZW5lZCA9IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBsaXN0ZW5hYmxlcykge1xuICAgICAgICB2YXIgbGlzdGVuYWJsZSA9IGxpc3RlbmFibGVzW2tleV07XG4gICAgICAgIHZhciBjaGlsZE1hcCA9IG1hcENoaWxkTGlzdGVuYWJsZXMobGlzdGVuYWJsZSk7XG5cbiAgICAgICAgLy8gcmVjdXJzaXZlbHkgZmxhdHRlbiBjaGlsZHJlblxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBmbGF0dGVuTGlzdGVuYWJsZXMoY2hpbGRNYXApO1xuXG4gICAgICAgIC8vIGFkZCB0aGUgcHJpbWFyeSBsaXN0ZW5hYmxlIGFuZCBjaGlscmVuXG4gICAgICAgIGZsYXR0ZW5lZFtrZXldID0gbGlzdGVuYWJsZTtcbiAgICAgICAgZm9yICh2YXIgY2hpbGRLZXkgaW4gY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHZhciBjaGlsZExpc3RlbmFibGUgPSBjaGlsZHJlbltjaGlsZEtleV07XG4gICAgICAgICAgICBmbGF0dGVuZWRba2V5ICsgXy5jYXBpdGFsaXplKGNoaWxkS2V5KV0gPSBjaGlsZExpc3RlbmFibGU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmxhdHRlbmVkO1xufTtcblxuLyoqXG4gKiBBIG1vZHVsZSBvZiBtZXRob2RzIHJlbGF0ZWQgdG8gbGlzdGVuaW5nLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIC8qKlxuICAgICAqIEFuIGludGVybmFsIHV0aWxpdHkgZnVuY3Rpb24gdXNlZCBieSBgdmFsaWRhdGVMaXN0ZW5pbmdgXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FjdGlvbnxTdG9yZX0gbGlzdGVuYWJsZSBUaGUgbGlzdGVuYWJsZSB3ZSB3YW50IHRvIHNlYXJjaCBmb3JcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVGhlIHJlc3VsdCBvZiBhIHJlY3Vyc2l2ZSBzZWFyY2ggYW1vbmcgYHRoaXMuc3Vic2NyaXB0aW9uc2BcbiAgICAgKi9cbiAgICBoYXNMaXN0ZW5lcjogZnVuY3Rpb24gaGFzTGlzdGVuZXIobGlzdGVuYWJsZSkge1xuICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICBqLFxuICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICBsaXN0ZW5hYmxlcztcbiAgICAgICAgZm9yICg7IGkgPCAodGhpcy5zdWJzY3JpcHRpb25zIHx8IFtdKS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgbGlzdGVuYWJsZXMgPSBbXS5jb25jYXQodGhpcy5zdWJzY3JpcHRpb25zW2ldLmxpc3RlbmFibGUpO1xuICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IGxpc3RlbmFibGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIgPSBsaXN0ZW5hYmxlc1tqXTtcbiAgICAgICAgICAgICAgICBpZiAobGlzdGVuZXIgPT09IGxpc3RlbmFibGUgfHwgbGlzdGVuZXIuaGFzTGlzdGVuZXIgJiYgbGlzdGVuZXIuaGFzTGlzdGVuZXIobGlzdGVuYWJsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQSBjb252ZW5pZW5jZSBtZXRob2QgdGhhdCBsaXN0ZW5zIHRvIGFsbCBsaXN0ZW5hYmxlcyBpbiB0aGUgZ2l2ZW4gb2JqZWN0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmFibGVzIEFuIG9iamVjdCBvZiBsaXN0ZW5hYmxlcy4gS2V5cyB3aWxsIGJlIHVzZWQgYXMgY2FsbGJhY2sgbWV0aG9kIG5hbWVzLlxuICAgICAqL1xuICAgIGxpc3RlblRvTWFueTogZnVuY3Rpb24gbGlzdGVuVG9NYW55KGxpc3RlbmFibGVzKSB7XG4gICAgICAgIHZhciBhbGxMaXN0ZW5hYmxlcyA9IGZsYXR0ZW5MaXN0ZW5hYmxlcyhsaXN0ZW5hYmxlcyk7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBhbGxMaXN0ZW5hYmxlcykge1xuICAgICAgICAgICAgdmFyIGNibmFtZSA9IF8uY2FsbGJhY2tOYW1lKGtleSksXG4gICAgICAgICAgICAgICAgbG9jYWxuYW1lID0gdGhpc1tjYm5hbWVdID8gY2JuYW1lIDogdGhpc1trZXldID8ga2V5IDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGxvY2FsbmFtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuVG8oYWxsTGlzdGVuYWJsZXNba2V5XSwgbG9jYWxuYW1lLCB0aGlzW2NibmFtZSArIFwiRGVmYXVsdFwiXSB8fCB0aGlzW2xvY2FsbmFtZSArIFwiRGVmYXVsdFwiXSB8fCBsb2NhbG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBjb250ZXh0IGNhbiBsaXN0ZW4gdG8gdGhlIHN1cHBsaWVkIGxpc3RlbmFibGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QWN0aW9ufFN0b3JlfSBsaXN0ZW5hYmxlIEFuIEFjdGlvbiBvciBTdG9yZSB0aGF0IHNob3VsZCBiZVxuICAgICAqICBsaXN0ZW5lZCB0by5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfFVuZGVmaW5lZH0gQW4gZXJyb3IgbWVzc2FnZSwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIHdhcyBubyBwcm9ibGVtLlxuICAgICAqL1xuICAgIHZhbGlkYXRlTGlzdGVuaW5nOiBmdW5jdGlvbiB2YWxpZGF0ZUxpc3RlbmluZyhsaXN0ZW5hYmxlKSB7XG4gICAgICAgIGlmIChsaXN0ZW5hYmxlID09PSB0aGlzKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJMaXN0ZW5lciBpcyBub3QgYWJsZSB0byBsaXN0ZW4gdG8gaXRzZWxmXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24obGlzdGVuYWJsZS5saXN0ZW4pKSB7XG4gICAgICAgICAgICByZXR1cm4gbGlzdGVuYWJsZSArIFwiIGlzIG1pc3NpbmcgYSBsaXN0ZW4gbWV0aG9kXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpc3RlbmFibGUuaGFzTGlzdGVuZXIgJiYgbGlzdGVuYWJsZS5oYXNMaXN0ZW5lcih0aGlzKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiTGlzdGVuZXIgY2Fubm90IGxpc3RlbiB0byB0aGlzIGxpc3RlbmFibGUgYmVjYXVzZSBvZiBjaXJjdWxhciBsb29wXCI7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCBhIHN1YnNjcmlwdGlvbiB0byB0aGUgZ2l2ZW4gbGlzdGVuYWJsZSBmb3IgdGhlIGNvbnRleHQgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FjdGlvbnxTdG9yZX0gbGlzdGVuYWJsZSBBbiBBY3Rpb24gb3IgU3RvcmUgdGhhdCBzaG91bGQgYmVcbiAgICAgKiAgbGlzdGVuZWQgdG8uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGNhbGxiYWNrIFRoZSBjYWxsYmFjayB0byByZWdpc3RlciBhcyBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGRlZmF1bHRDYWxsYmFjayBUaGUgY2FsbGJhY2sgdG8gcmVnaXN0ZXIgYXMgZGVmYXVsdCBoYW5kbGVyXG4gICAgICogQHJldHVybnMge09iamVjdH0gQSBzdWJzY3JpcHRpb24gb2JqIHdoZXJlIGBzdG9wYCBpcyBhbiB1bnN1YiBmdW5jdGlvbiBhbmQgYGxpc3RlbmFibGVgIGlzIHRoZSBvYmplY3QgYmVpbmcgbGlzdGVuZWQgdG9cbiAgICAgKi9cbiAgICBsaXN0ZW5UbzogZnVuY3Rpb24gbGlzdGVuVG8obGlzdGVuYWJsZSwgY2FsbGJhY2ssIGRlZmF1bHRDYWxsYmFjaykge1xuICAgICAgICB2YXIgZGVzdWIsXG4gICAgICAgICAgICB1bnN1YnNjcmliZXIsXG4gICAgICAgICAgICBzdWJzY3JpcHRpb25vYmosXG4gICAgICAgICAgICBzdWJzID0gdGhpcy5zdWJzY3JpcHRpb25zID0gdGhpcy5zdWJzY3JpcHRpb25zIHx8IFtdO1xuICAgICAgICBfLnRocm93SWYodGhpcy52YWxpZGF0ZUxpc3RlbmluZyhsaXN0ZW5hYmxlKSk7XG4gICAgICAgIHRoaXMuZmV0Y2hJbml0aWFsU3RhdGUobGlzdGVuYWJsZSwgZGVmYXVsdENhbGxiYWNrKTtcbiAgICAgICAgZGVzdWIgPSBsaXN0ZW5hYmxlLmxpc3Rlbih0aGlzW2NhbGxiYWNrXSB8fCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICAgIHVuc3Vic2NyaWJlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHN1YnMuaW5kZXhPZihzdWJzY3JpcHRpb25vYmopO1xuICAgICAgICAgICAgXy50aHJvd0lmKGluZGV4ID09PSAtMSwgXCJUcmllZCB0byByZW1vdmUgbGlzdGVuIGFscmVhZHkgZ29uZSBmcm9tIHN1YnNjcmlwdGlvbnMgbGlzdCFcIik7XG4gICAgICAgICAgICBzdWJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICBkZXN1YigpO1xuICAgICAgICB9O1xuICAgICAgICBzdWJzY3JpcHRpb25vYmogPSB7XG4gICAgICAgICAgICBzdG9wOiB1bnN1YnNjcmliZXIsXG4gICAgICAgICAgICBsaXN0ZW5hYmxlOiBsaXN0ZW5hYmxlXG4gICAgICAgIH07XG4gICAgICAgIHN1YnMucHVzaChzdWJzY3JpcHRpb25vYmopO1xuICAgICAgICByZXR1cm4gc3Vic2NyaXB0aW9ub2JqO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBsaXN0ZW5pbmcgdG8gYSBzaW5nbGUgbGlzdGVuYWJsZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtBY3Rpb258U3RvcmV9IGxpc3RlbmFibGUgVGhlIGFjdGlvbiBvciBzdG9yZSB3ZSBubyBsb25nZXIgd2FudCB0byBsaXN0ZW4gdG9cbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiBhIHN1YnNjcmlwdGlvbiB3YXMgZm91bmQgYW5kIHJlbW92ZWQsIG90aGVyd2lzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBzdG9wTGlzdGVuaW5nVG86IGZ1bmN0aW9uIHN0b3BMaXN0ZW5pbmdUbyhsaXN0ZW5hYmxlKSB7XG4gICAgICAgIHZhciBzdWIsXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIHN1YnMgPSB0aGlzLnN1YnNjcmlwdGlvbnMgfHwgW107XG4gICAgICAgIGZvciAoOyBpIDwgc3Vicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc3ViID0gc3Vic1tpXTtcbiAgICAgICAgICAgIGlmIChzdWIubGlzdGVuYWJsZSA9PT0gbGlzdGVuYWJsZSkge1xuICAgICAgICAgICAgICAgIHN1Yi5zdG9wKCk7XG4gICAgICAgICAgICAgICAgXy50aHJvd0lmKHN1YnMuaW5kZXhPZihzdWIpICE9PSAtMSwgXCJGYWlsZWQgdG8gcmVtb3ZlIGxpc3RlbiBmcm9tIHN1YnNjcmlwdGlvbnMgbGlzdCFcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBhbGwgc3Vic2NyaXB0aW9ucyBhbmQgZW1wdGllcyBzdWJzY3JpcHRpb25zIGFycmF5XG4gICAgICovXG4gICAgc3RvcExpc3RlbmluZ1RvQWxsOiBmdW5jdGlvbiBzdG9wTGlzdGVuaW5nVG9BbGwoKSB7XG4gICAgICAgIHZhciByZW1haW5pbmcsXG4gICAgICAgICAgICBzdWJzID0gdGhpcy5zdWJzY3JpcHRpb25zIHx8IFtdO1xuICAgICAgICB3aGlsZSAocmVtYWluaW5nID0gc3Vicy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHN1YnNbMF0uc3RvcCgpO1xuICAgICAgICAgICAgXy50aHJvd0lmKHN1YnMubGVuZ3RoICE9PSByZW1haW5pbmcgLSAxLCBcIkZhaWxlZCB0byByZW1vdmUgbGlzdGVuIGZyb20gc3Vic2NyaXB0aW9ucyBsaXN0IVwiKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVc2VkIGluIGBsaXN0ZW5Ub2AuIEZldGNoZXMgaW5pdGlhbCBkYXRhIGZyb20gYSBwdWJsaXNoZXIgaWYgaXQgaGFzIGEgYGdldEluaXRpYWxTdGF0ZWAgbWV0aG9kLlxuICAgICAqIEBwYXJhbSB7QWN0aW9ufFN0b3JlfSBsaXN0ZW5hYmxlIFRoZSBwdWJsaXNoZXIgd2Ugd2FudCB0byBnZXQgaW5pdGlhbCBzdGF0ZSBmcm9tXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGRlZmF1bHRDYWxsYmFjayBUaGUgbWV0aG9kIHRvIHJlY2VpdmUgdGhlIGRhdGFcbiAgICAgKi9cbiAgICBmZXRjaEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZmV0Y2hJbml0aWFsU3RhdGUobGlzdGVuYWJsZSwgZGVmYXVsdENhbGxiYWNrKSB7XG4gICAgICAgIGRlZmF1bHRDYWxsYmFjayA9IGRlZmF1bHRDYWxsYmFjayAmJiB0aGlzW2RlZmF1bHRDYWxsYmFja10gfHwgZGVmYXVsdENhbGxiYWNrO1xuICAgICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGRlZmF1bHRDYWxsYmFjaykgJiYgXy5pc0Z1bmN0aW9uKGxpc3RlbmFibGUuZ2V0SW5pdGlhbFN0YXRlKSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBsaXN0ZW5hYmxlLmdldEluaXRpYWxTdGF0ZSgpO1xuICAgICAgICAgICAgaWYgKGRhdGEgJiYgXy5pc0Z1bmN0aW9uKGRhdGEudGhlbikpIHtcbiAgICAgICAgICAgICAgICBkYXRhLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0Q2FsbGJhY2suYXBwbHkobWUsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRDYWxsYmFjay5jYWxsKHRoaXMsIGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBvbmNlIGFsbCBsaXN0ZW5hYmxlcyBoYXZlIHRyaWdnZXJlZCBhdCBsZWFzdCBvbmNlLlxuICAgICAqIEl0IHdpbGwgYmUgaW52b2tlZCB3aXRoIHRoZSBsYXN0IGVtaXNzaW9uIGZyb20gZWFjaCBsaXN0ZW5hYmxlLlxuICAgICAqIEBwYXJhbSB7Li4uUHVibGlzaGVyc30gcHVibGlzaGVycyBQdWJsaXNoZXJzIHRoYXQgc2hvdWxkIGJlIHRyYWNrZWQuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGNhbGxiYWNrIFRoZSBtZXRob2QgdG8gY2FsbCB3aGVuIGFsbCBwdWJsaXNoZXJzIGhhdmUgZW1pdHRlZFxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IEEgc3Vic2NyaXB0aW9uIG9iaiB3aGVyZSBgc3RvcGAgaXMgYW4gdW5zdWIgZnVuY3Rpb24gYW5kIGBsaXN0ZW5hYmxlYCBpcyBhbiBhcnJheSBvZiBsaXN0ZW5hYmxlc1xuICAgICAqL1xuICAgIGpvaW5UcmFpbGluZzogbWFrZXIoXCJsYXN0XCIpLFxuXG4gICAgLyoqXG4gICAgICogVGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIG9uY2UgYWxsIGxpc3RlbmFibGVzIGhhdmUgdHJpZ2dlcmVkIGF0IGxlYXN0IG9uY2UuXG4gICAgICogSXQgd2lsbCBiZSBpbnZva2VkIHdpdGggdGhlIGZpcnN0IGVtaXNzaW9uIGZyb20gZWFjaCBsaXN0ZW5hYmxlLlxuICAgICAqIEBwYXJhbSB7Li4uUHVibGlzaGVyc30gcHVibGlzaGVycyBQdWJsaXNoZXJzIHRoYXQgc2hvdWxkIGJlIHRyYWNrZWQuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGNhbGxiYWNrIFRoZSBtZXRob2QgdG8gY2FsbCB3aGVuIGFsbCBwdWJsaXNoZXJzIGhhdmUgZW1pdHRlZFxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IEEgc3Vic2NyaXB0aW9uIG9iaiB3aGVyZSBgc3RvcGAgaXMgYW4gdW5zdWIgZnVuY3Rpb24gYW5kIGBsaXN0ZW5hYmxlYCBpcyBhbiBhcnJheSBvZiBsaXN0ZW5hYmxlc1xuICAgICAqL1xuICAgIGpvaW5MZWFkaW5nOiBtYWtlcihcImZpcnN0XCIpLFxuXG4gICAgLyoqXG4gICAgICogVGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIG9uY2UgYWxsIGxpc3RlbmFibGVzIGhhdmUgdHJpZ2dlcmVkIGF0IGxlYXN0IG9uY2UuXG4gICAgICogSXQgd2lsbCBiZSBpbnZva2VkIHdpdGggYWxsIGVtaXNzaW9uIGZyb20gZWFjaCBsaXN0ZW5hYmxlLlxuICAgICAqIEBwYXJhbSB7Li4uUHVibGlzaGVyc30gcHVibGlzaGVycyBQdWJsaXNoZXJzIHRoYXQgc2hvdWxkIGJlIHRyYWNrZWQuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGNhbGxiYWNrIFRoZSBtZXRob2QgdG8gY2FsbCB3aGVuIGFsbCBwdWJsaXNoZXJzIGhhdmUgZW1pdHRlZFxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IEEgc3Vic2NyaXB0aW9uIG9iaiB3aGVyZSBgc3RvcGAgaXMgYW4gdW5zdWIgZnVuY3Rpb24gYW5kIGBsaXN0ZW5hYmxlYCBpcyBhbiBhcnJheSBvZiBsaXN0ZW5hYmxlc1xuICAgICAqL1xuICAgIGpvaW5Db25jYXQ6IG1ha2VyKFwiYWxsXCIpLFxuXG4gICAgLyoqXG4gICAgICogVGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIG9uY2UgYWxsIGxpc3RlbmFibGVzIGhhdmUgdHJpZ2dlcmVkLlxuICAgICAqIElmIGEgY2FsbGJhY2sgdHJpZ2dlcnMgdHdpY2UgYmVmb3JlIHRoYXQgaGFwcGVucywgYW4gZXJyb3IgaXMgdGhyb3duLlxuICAgICAqIEBwYXJhbSB7Li4uUHVibGlzaGVyc30gcHVibGlzaGVycyBQdWJsaXNoZXJzIHRoYXQgc2hvdWxkIGJlIHRyYWNrZWQuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGNhbGxiYWNrIFRoZSBtZXRob2QgdG8gY2FsbCB3aGVuIGFsbCBwdWJsaXNoZXJzIGhhdmUgZW1pdHRlZFxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IEEgc3Vic2NyaXB0aW9uIG9iaiB3aGVyZSBgc3RvcGAgaXMgYW4gdW5zdWIgZnVuY3Rpb24gYW5kIGBsaXN0ZW5hYmxlYCBpcyBhbiBhcnJheSBvZiBsaXN0ZW5hYmxlc1xuICAgICAqL1xuICAgIGpvaW5TdHJpY3Q6IG1ha2VyKFwic3RyaWN0XCIpXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuXG4vKipcbiAqIEEgbW9kdWxlIG9mIG1ldGhvZHMgZm9yIG9iamVjdCB0aGF0IHlvdSB3YW50IHRvIGJlIGFibGUgdG8gbGlzdGVuIHRvLlxuICogVGhpcyBtb2R1bGUgaXMgY29uc3VtZWQgYnkgYGNyZWF0ZVN0b3JlYCBhbmQgYGNyZWF0ZUFjdGlvbmBcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICAvKipcbiAgICAgKiBIb29rIHVzZWQgYnkgdGhlIHB1Ymxpc2hlciB0aGF0IGlzIGludm9rZWQgYmVmb3JlIGVtaXR0aW5nXG4gICAgICogYW5kIGJlZm9yZSBgc2hvdWxkRW1pdGAuIFRoZSBhcmd1bWVudHMgYXJlIHRoZSBvbmVzIHRoYXQgdGhlIGFjdGlvblxuICAgICAqIGlzIGludm9rZWQgd2l0aC4gSWYgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHNvbWV0aGluZyBvdGhlciB0aGFuXG4gICAgICogdW5kZWZpbmVkLCB0aGF0IHdpbGwgYmUgcGFzc2VkIG9uIGFzIGFyZ3VtZW50cyBmb3Igc2hvdWxkRW1pdCBhbmRcbiAgICAgKiBlbWlzc2lvbi5cbiAgICAgKi9cbiAgICBwcmVFbWl0OiBmdW5jdGlvbiBwcmVFbWl0KCkge30sXG5cbiAgICAvKipcbiAgICAgKiBIb29rIHVzZWQgYnkgdGhlIHB1Ymxpc2hlciBhZnRlciBgcHJlRW1pdGAgdG8gZGV0ZXJtaW5lIGlmIHRoZVxuICAgICAqIGV2ZW50IHNob3VsZCBiZSBlbWl0dGVkIHdpdGggZ2l2ZW4gYXJndW1lbnRzLiBUaGlzIG1heSBiZSBvdmVycmlkZGVuXG4gICAgICogaW4geW91ciBhcHBsaWNhdGlvbiwgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBhbHdheXMgcmV0dXJucyB0cnVlLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IHRydWUgaWYgZXZlbnQgc2hvdWxkIGJlIGVtaXR0ZWRcbiAgICAgKi9cbiAgICBzaG91bGRFbWl0OiBmdW5jdGlvbiBzaG91bGRFbWl0KCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3Vic2NyaWJlcyB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGFjdGlvbiB0cmlnZ2VyZWRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBjYWxsYmFjayB0byByZWdpc3RlciBhcyBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtNaXhlZH0gW29wdGlvbmFsXSBiaW5kQ29udGV4dCBUaGUgY29udGV4dCB0byBiaW5kIHRoZSBjYWxsYmFjayB3aXRoXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBDYWxsYmFjayB0aGF0IHVuc3Vic2NyaWJlcyB0aGUgcmVnaXN0ZXJlZCBldmVudCBoYW5kbGVyXG4gICAgICovXG4gICAgbGlzdGVuOiBmdW5jdGlvbiBsaXN0ZW4oY2FsbGJhY2ssIGJpbmRDb250ZXh0KSB7XG4gICAgICAgIGJpbmRDb250ZXh0ID0gYmluZENvbnRleHQgfHwgdGhpcztcbiAgICAgICAgdmFyIGV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uIGV2ZW50SGFuZGxlcihhcmdzKSB7XG4gICAgICAgICAgICBpZiAoYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGJpbmRDb250ZXh0LCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgICAgIG1lID0gdGhpcyxcbiAgICAgICAgICAgIGFib3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmFkZExpc3RlbmVyKHRoaXMuZXZlbnRMYWJlbCwgZXZlbnRIYW5kbGVyKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFib3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgbWUuZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihtZS5ldmVudExhYmVsLCBldmVudEhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoZXMgYW4gZXZlbnQgdXNpbmcgYHRoaXMuZW1pdHRlcmAgKGlmIGBzaG91bGRFbWl0YCBhZ3JlZXMpXG4gICAgICovXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24gdHJpZ2dlcigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgICBwcmUgPSB0aGlzLnByZUVtaXQuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIGFyZ3MgPSBwcmUgPT09IHVuZGVmaW5lZCA/IGFyZ3MgOiBfLmlzQXJndW1lbnRzKHByZSkgPyBwcmUgOiBbXS5jb25jYXQocHJlKTtcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkRW1pdC5hcHBseSh0aGlzLCBhcmdzKSkge1xuICAgICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQodGhpcy5ldmVudExhYmVsLCBhcmdzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUcmllcyB0byBwdWJsaXNoIHRoZSBldmVudCBvbiB0aGUgbmV4dCB0aWNrXG4gICAgICovXG4gICAgdHJpZ2dlckFzeW5jOiBmdW5jdGlvbiB0cmlnZ2VyQXN5bmMoKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgICAgbWUgPSB0aGlzO1xuICAgICAgICBfLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1lLnRyaWdnZXIuYXBwbHkobWUsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV3JhcHMgdGhlIHRyaWdnZXIgbWVjaGFuaXNtIHdpdGggYSBkZWZlcnJhbCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRoZSBkZWZlcnJhbCBmdW5jdGlvbixcbiAgICAgKiAgICAgICAgZmlyc3QgYXJndW1lbnQgaXMgdGhlIHJlc29sdmluZyBmdW5jdGlvbiBhbmQgdGhlXG4gICAgICogICAgICAgIHJlc3QgYXJlIHRoZSBhcmd1bWVudHMgcHJvdmlkZWQgZnJvbSB0aGUgcHJldmlvdXNcbiAgICAgKiAgICAgICAgdHJpZ2dlciBpbnZvY2F0aW9uXG4gICAgICovXG4gICAgZGVmZXJXaXRoOiBmdW5jdGlvbiBkZWZlcldpdGgoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG9sZFRyaWdnZXIgPSB0aGlzLnRyaWdnZXIsXG4gICAgICAgICAgICBjdHggPSB0aGlzLFxuICAgICAgICAgICAgcmVzb2x2ZXIgPSBmdW5jdGlvbiByZXNvbHZlcigpIHtcbiAgICAgICAgICAgIG9sZFRyaWdnZXIuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnRyaWdnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseShjdHgsIFtyZXNvbHZlcl0uY29uY2F0KFtdLnNwbGljZS5jYWxsKGFyZ3VtZW50cywgMCkpKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbn07IiwiLyoqXG4gKiBBIG1vZHVsZSBvZiBtZXRob2RzIHRoYXQgeW91IHdhbnQgdG8gaW5jbHVkZSBpbiBhbGwgc3RvcmVzLlxuICogVGhpcyBtb2R1bGUgaXMgY29uc3VtZWQgYnkgYGNyZWF0ZVN0b3JlYC5cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge307IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0b3JlLCBkZWZpbml0aW9uKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiBkZWZpbml0aW9uKSB7XG4gICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkge1xuICAgICAgICAgICAgdmFyIHByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZGVmaW5pdGlvbiwgbmFtZSk7XG5cbiAgICAgICAgICAgIGlmICghcHJvcGVydHlEZXNjcmlwdG9yLnZhbHVlIHx8IHR5cGVvZiBwcm9wZXJ0eURlc2NyaXB0b3IudmFsdWUgIT09IFwiZnVuY3Rpb25cIiB8fCAhZGVmaW5pdGlvbi5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdG9yZVtuYW1lXSA9IGRlZmluaXRpb25bbmFtZV0uYmluZChzdG9yZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgcHJvcGVydHkgPSBkZWZpbml0aW9uW25hbWVdO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb3BlcnR5ICE9PSBcImZ1bmN0aW9uXCIgfHwgIWRlZmluaXRpb24uaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RvcmVbbmFtZV0gPSBwcm9wZXJ0eS5iaW5kKHN0b3JlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdG9yZTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4vdXRpbHNcIiksXG4gICAgQWN0aW9uTWV0aG9kcyA9IHJlcXVpcmUoXCIuL0FjdGlvbk1ldGhvZHNcIiksXG4gICAgUHVibGlzaGVyTWV0aG9kcyA9IHJlcXVpcmUoXCIuL1B1Ymxpc2hlck1ldGhvZHNcIiksXG4gICAgS2VlcCA9IHJlcXVpcmUoXCIuL0tlZXBcIik7XG5cbnZhciBhbGxvd2VkID0geyBwcmVFbWl0OiAxLCBzaG91bGRFbWl0OiAxIH07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhY3Rpb24gZnVuY3RvciBvYmplY3QuIEl0IGlzIG1peGVkIGluIHdpdGggZnVuY3Rpb25zXG4gKiBmcm9tIHRoZSBgUHVibGlzaGVyTWV0aG9kc2AgbWl4aW4uIGBwcmVFbWl0YCBhbmQgYHNob3VsZEVtaXRgIG1heVxuICogYmUgb3ZlcnJpZGRlbiBpbiB0aGUgZGVmaW5pdGlvbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmluaXRpb24gVGhlIGFjdGlvbiBvYmplY3QgZGVmaW5pdGlvblxuICovXG52YXIgY3JlYXRlQWN0aW9uID0gZnVuY3Rpb24gY3JlYXRlQWN0aW9uKGRlZmluaXRpb24pIHtcblxuICAgIGRlZmluaXRpb24gPSBkZWZpbml0aW9uIHx8IHt9O1xuICAgIGlmICghXy5pc09iamVjdChkZWZpbml0aW9uKSkge1xuICAgICAgICBkZWZpbml0aW9uID0geyBhY3Rpb25OYW1lOiBkZWZpbml0aW9uIH07XG4gICAgfVxuXG4gICAgZm9yICh2YXIgYSBpbiBBY3Rpb25NZXRob2RzKSB7XG4gICAgICAgIGlmICghYWxsb3dlZFthXSAmJiBQdWJsaXNoZXJNZXRob2RzW2FdKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgb3ZlcnJpZGUgQVBJIG1ldGhvZCBcIiArIGEgKyBcIiBpbiBSZWZsdXguQWN0aW9uTWV0aG9kcy4gVXNlIGFub3RoZXIgbWV0aG9kIG5hbWUgb3Igb3ZlcnJpZGUgaXQgb24gUmVmbHV4LlB1Ymxpc2hlck1ldGhvZHMgaW5zdGVhZC5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBkIGluIGRlZmluaXRpb24pIHtcbiAgICAgICAgaWYgKCFhbGxvd2VkW2RdICYmIFB1Ymxpc2hlck1ldGhvZHNbZF0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBvdmVycmlkZSBBUEkgbWV0aG9kIFwiICsgZCArIFwiIGluIGFjdGlvbiBjcmVhdGlvbi4gVXNlIGFub3RoZXIgbWV0aG9kIG5hbWUgb3Igb3ZlcnJpZGUgaXQgb24gUmVmbHV4LlB1Ymxpc2hlck1ldGhvZHMgaW5zdGVhZC5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWZpbml0aW9uLmNoaWxkcmVuID0gZGVmaW5pdGlvbi5jaGlsZHJlbiB8fCBbXTtcbiAgICBpZiAoZGVmaW5pdGlvbi5hc3luY1Jlc3VsdCkge1xuICAgICAgICBkZWZpbml0aW9uLmNoaWxkcmVuID0gZGVmaW5pdGlvbi5jaGlsZHJlbi5jb25jYXQoW1wiY29tcGxldGVkXCIsIFwiZmFpbGVkXCJdKTtcbiAgICB9XG5cbiAgICB2YXIgaSA9IDAsXG4gICAgICAgIGNoaWxkQWN0aW9ucyA9IHt9O1xuICAgIGZvciAoOyBpIDwgZGVmaW5pdGlvbi5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmFtZSA9IGRlZmluaXRpb24uY2hpbGRyZW5baV07XG4gICAgICAgIGNoaWxkQWN0aW9uc1tuYW1lXSA9IGNyZWF0ZUFjdGlvbihuYW1lKTtcbiAgICB9XG5cbiAgICB2YXIgY29udGV4dCA9IF8uZXh0ZW5kKHtcbiAgICAgICAgZXZlbnRMYWJlbDogXCJhY3Rpb25cIixcbiAgICAgICAgZW1pdHRlcjogbmV3IF8uRXZlbnRFbWl0dGVyKCksXG4gICAgICAgIF9pc0FjdGlvbjogdHJ1ZVxuICAgIH0sIFB1Ymxpc2hlck1ldGhvZHMsIEFjdGlvbk1ldGhvZHMsIGRlZmluaXRpb24pO1xuXG4gICAgdmFyIGZ1bmN0b3IgPSBmdW5jdGlvbiBmdW5jdG9yKCkge1xuICAgICAgICB2YXIgdHJpZ2dlclR5cGUgPSBmdW5jdG9yLnN5bmMgPyBcInRyaWdnZXJcIiA6IFwidHJpZ2dlckFzeW5jXCI7XG4gICAgICAgIHJldHVybiBmdW5jdG9yW3RyaWdnZXJUeXBlXS5hcHBseShmdW5jdG9yLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBfLmV4dGVuZChmdW5jdG9yLCBjaGlsZEFjdGlvbnMsIGNvbnRleHQpO1xuXG4gICAgS2VlcC5jcmVhdGVkQWN0aW9ucy5wdXNoKGZ1bmN0b3IpO1xuXG4gICAgcmV0dXJuIGZ1bmN0b3I7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUFjdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKFwiLi91dGlsc1wiKSxcbiAgICBLZWVwID0gcmVxdWlyZShcIi4vS2VlcFwiKSxcbiAgICBtaXhlciA9IHJlcXVpcmUoXCIuL21peGVyXCIpLFxuICAgIGJpbmRNZXRob2RzID0gcmVxdWlyZShcIi4vYmluZE1ldGhvZHNcIik7XG5cbnZhciBhbGxvd2VkID0geyBwcmVFbWl0OiAxLCBzaG91bGRFbWl0OiAxIH07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBldmVudCBlbWl0dGluZyBEYXRhIFN0b3JlLiBJdCBpcyBtaXhlZCBpbiB3aXRoIGZ1bmN0aW9uc1xuICogZnJvbSB0aGUgYExpc3RlbmVyTWV0aG9kc2AgYW5kIGBQdWJsaXNoZXJNZXRob2RzYCBtaXhpbnMuIGBwcmVFbWl0YFxuICogYW5kIGBzaG91bGRFbWl0YCBtYXkgYmUgb3ZlcnJpZGRlbiBpbiB0aGUgZGVmaW5pdGlvbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmluaXRpb24gVGhlIGRhdGEgc3RvcmUgb2JqZWN0IGRlZmluaXRpb25cbiAqIEByZXR1cm5zIHtTdG9yZX0gQSBkYXRhIHN0b3JlIGluc3RhbmNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcblxuICAgIHZhciBTdG9yZU1ldGhvZHMgPSByZXF1aXJlKFwiLi9TdG9yZU1ldGhvZHNcIiksXG4gICAgICAgIFB1Ymxpc2hlck1ldGhvZHMgPSByZXF1aXJlKFwiLi9QdWJsaXNoZXJNZXRob2RzXCIpLFxuICAgICAgICBMaXN0ZW5lck1ldGhvZHMgPSByZXF1aXJlKFwiLi9MaXN0ZW5lck1ldGhvZHNcIik7XG5cbiAgICBkZWZpbml0aW9uID0gZGVmaW5pdGlvbiB8fCB7fTtcblxuICAgIGZvciAodmFyIGEgaW4gU3RvcmVNZXRob2RzKSB7XG4gICAgICAgIGlmICghYWxsb3dlZFthXSAmJiAoUHVibGlzaGVyTWV0aG9kc1thXSB8fCBMaXN0ZW5lck1ldGhvZHNbYV0pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgb3ZlcnJpZGUgQVBJIG1ldGhvZCBcIiArIGEgKyBcIiBpbiBSZWZsdXguU3RvcmVNZXRob2RzLiBVc2UgYW5vdGhlciBtZXRob2QgbmFtZSBvciBvdmVycmlkZSBpdCBvbiBSZWZsdXguUHVibGlzaGVyTWV0aG9kcyAvIFJlZmx1eC5MaXN0ZW5lck1ldGhvZHMgaW5zdGVhZC5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBkIGluIGRlZmluaXRpb24pIHtcbiAgICAgICAgaWYgKCFhbGxvd2VkW2RdICYmIChQdWJsaXNoZXJNZXRob2RzW2RdIHx8IExpc3RlbmVyTWV0aG9kc1tkXSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBvdmVycmlkZSBBUEkgbWV0aG9kIFwiICsgZCArIFwiIGluIHN0b3JlIGNyZWF0aW9uLiBVc2UgYW5vdGhlciBtZXRob2QgbmFtZSBvciBvdmVycmlkZSBpdCBvbiBSZWZsdXguUHVibGlzaGVyTWV0aG9kcyAvIFJlZmx1eC5MaXN0ZW5lck1ldGhvZHMgaW5zdGVhZC5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWZpbml0aW9uID0gbWl4ZXIoZGVmaW5pdGlvbik7XG5cbiAgICBmdW5jdGlvbiBTdG9yZSgpIHtcbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgYXJyO1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcbiAgICAgICAgdGhpcy5lbWl0dGVyID0gbmV3IF8uRXZlbnRFbWl0dGVyKCk7XG4gICAgICAgIHRoaXMuZXZlbnRMYWJlbCA9IFwiY2hhbmdlXCI7XG4gICAgICAgIGJpbmRNZXRob2RzKHRoaXMsIGRlZmluaXRpb24pO1xuICAgICAgICBpZiAodGhpcy5pbml0ICYmIF8uaXNGdW5jdGlvbih0aGlzLmluaXQpKSB7XG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5saXN0ZW5hYmxlcykge1xuICAgICAgICAgICAgYXJyID0gW10uY29uY2F0KHRoaXMubGlzdGVuYWJsZXMpO1xuICAgICAgICAgICAgZm9yICg7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RlblRvTWFueShhcnJbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgXy5leHRlbmQoU3RvcmUucHJvdG90eXBlLCBMaXN0ZW5lck1ldGhvZHMsIFB1Ymxpc2hlck1ldGhvZHMsIFN0b3JlTWV0aG9kcywgZGVmaW5pdGlvbik7XG5cbiAgICB2YXIgc3RvcmUgPSBuZXcgU3RvcmUoKTtcbiAgICBLZWVwLmNyZWF0ZWRTdG9yZXMucHVzaChzdG9yZSk7XG5cbiAgICByZXR1cm4gc3RvcmU7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgUmVmbHV4ID0ge1xuICAgIHZlcnNpb246IHtcbiAgICAgICAgXCJyZWZsdXgtY29yZVwiOiBcIjAuMy4wXCJcbiAgICB9XG59O1xuXG5SZWZsdXguQWN0aW9uTWV0aG9kcyA9IHJlcXVpcmUoXCIuL0FjdGlvbk1ldGhvZHNcIik7XG5cblJlZmx1eC5MaXN0ZW5lck1ldGhvZHMgPSByZXF1aXJlKFwiLi9MaXN0ZW5lck1ldGhvZHNcIik7XG5cblJlZmx1eC5QdWJsaXNoZXJNZXRob2RzID0gcmVxdWlyZShcIi4vUHVibGlzaGVyTWV0aG9kc1wiKTtcblxuUmVmbHV4LlN0b3JlTWV0aG9kcyA9IHJlcXVpcmUoXCIuL1N0b3JlTWV0aG9kc1wiKTtcblxuUmVmbHV4LmNyZWF0ZUFjdGlvbiA9IHJlcXVpcmUoXCIuL2NyZWF0ZUFjdGlvblwiKTtcblxuUmVmbHV4LmNyZWF0ZVN0b3JlID0gcmVxdWlyZShcIi4vY3JlYXRlU3RvcmVcIik7XG5cbnZhciBtYWtlciA9IHJlcXVpcmUoXCIuL2pvaW5zXCIpLnN0YXRpY0pvaW5DcmVhdG9yO1xuXG5SZWZsdXguam9pblRyYWlsaW5nID0gUmVmbHV4LmFsbCA9IG1ha2VyKFwibGFzdFwiKTsgLy8gUmVmbHV4LmFsbCBhbGlhcyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuXG5SZWZsdXguam9pbkxlYWRpbmcgPSBtYWtlcihcImZpcnN0XCIpO1xuXG5SZWZsdXguam9pblN0cmljdCA9IG1ha2VyKFwic3RyaWN0XCIpO1xuXG5SZWZsdXguam9pbkNvbmNhdCA9IG1ha2VyKFwiYWxsXCIpO1xuXG52YXIgXyA9IFJlZmx1eC51dGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuXG5SZWZsdXguRXZlbnRFbWl0dGVyID0gXy5FdmVudEVtaXR0ZXI7XG5cblJlZmx1eC5Qcm9taXNlID0gXy5Qcm9taXNlO1xuXG4vKipcbiAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhIHNldCBvZiBhY3Rpb25zXG4gKlxuICogQHBhcmFtIGRlZmluaXRpb25zIHRoZSBkZWZpbml0aW9ucyBmb3IgdGhlIGFjdGlvbnMgdG8gYmUgY3JlYXRlZFxuICogQHJldHVybnMgYW4gb2JqZWN0IHdpdGggYWN0aW9ucyBvZiBjb3JyZXNwb25kaW5nIGFjdGlvbiBuYW1lc1xuICovXG5SZWZsdXguY3JlYXRlQWN0aW9ucyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlZHVjZXIgPSBmdW5jdGlvbiByZWR1Y2VyKGRlZmluaXRpb25zLCBhY3Rpb25zKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKGRlZmluaXRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChhY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gZGVmaW5pdGlvbnNbYWN0aW9uTmFtZV07XG4gICAgICAgICAgICBhY3Rpb25zW2FjdGlvbk5hbWVdID0gUmVmbHV4LmNyZWF0ZUFjdGlvbih2YWwpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkZWZpbml0aW9ucykge1xuICAgICAgICB2YXIgYWN0aW9ucyA9IHt9O1xuICAgICAgICBpZiAoZGVmaW5pdGlvbnMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgZGVmaW5pdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uaXNPYmplY3QodmFsKSkge1xuICAgICAgICAgICAgICAgICAgICByZWR1Y2VyKHZhbCwgYWN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uc1t2YWxdID0gUmVmbHV4LmNyZWF0ZUFjdGlvbih2YWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVkdWNlcihkZWZpbml0aW9ucywgYWN0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGlvbnM7XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogU2V0cyB0aGUgZXZlbnRtaXR0ZXIgdGhhdCBSZWZsdXggdXNlc1xuICovXG5SZWZsdXguc2V0RXZlbnRFbWl0dGVyID0gZnVuY3Rpb24gKGN0eCkge1xuICAgIFJlZmx1eC5FdmVudEVtaXR0ZXIgPSBfLkV2ZW50RW1pdHRlciA9IGN0eDtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgbWV0aG9kIHVzZWQgZm9yIGRlZmVycmluZyBhY3Rpb25zIGFuZCBzdG9yZXNcbiAqL1xuUmVmbHV4Lm5leHRUaWNrID0gZnVuY3Rpb24gKG5leHRUaWNrKSB7XG4gICAgXy5uZXh0VGljayA9IG5leHRUaWNrO1xufTtcblxuUmVmbHV4LnVzZSA9IGZ1bmN0aW9uIChwbHVnaW5DYikge1xuICAgIHBsdWdpbkNiKFJlZmx1eCk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSBzZXQgb2YgY3JlYXRlZCBhY3Rpb25zIGFuZCBzdG9yZXMgZm9yIGludHJvc3BlY3Rpb25cbiAqL1xuLyplc2xpbnQtZGlzYWJsZSBuby11bmRlcnNjb3JlLWRhbmdsZSovXG5SZWZsdXguX19rZWVwID0gcmVxdWlyZShcIi4vS2VlcFwiKTtcbi8qZXNsaW50LWVuYWJsZSBuby11bmRlcnNjb3JlLWRhbmdsZSovXG5cbi8qKlxuICogV2FybiBpZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCBub3QgYXZhaWxhYmxlXG4gKi9cbmlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgbm90IGF2YWlsYWJsZS4gXCIgKyBcIkVTNSBzaGltIHJlcXVpcmVkLiBcIiArIFwiaHR0cHM6Ly9naXRodWIuY29tL3Nwb2lrZS9yZWZsdXhqcyNlczVcIik7XG59XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gUmVmbHV4O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCIvKipcbiAqIEludGVybmFsIG1vZHVsZSB1c2VkIHRvIGNyZWF0ZSBzdGF0aWMgYW5kIGluc3RhbmNlIGpvaW4gbWV0aG9kc1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgY3JlYXRlU3RvcmUgPSByZXF1aXJlKFwiLi9jcmVhdGVTdG9yZVwiKSxcbiAgICBfID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5cbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZSxcbiAgICBzdHJhdGVneU1ldGhvZE5hbWVzID0ge1xuICAgIHN0cmljdDogXCJqb2luU3RyaWN0XCIsXG4gICAgZmlyc3Q6IFwiam9pbkxlYWRpbmdcIixcbiAgICBsYXN0OiBcImpvaW5UcmFpbGluZ1wiLFxuICAgIGFsbDogXCJqb2luQ29uY2F0XCJcbn07XG5cbi8qKlxuICogVXNlZCBpbiBgaW5kZXguanNgIHRvIGNyZWF0ZSB0aGUgc3RhdGljIGpvaW4gbWV0aG9kc1xuICogQHBhcmFtIHtTdHJpbmd9IHN0cmF0ZWd5IFdoaWNoIHN0cmF0ZWd5IHRvIHVzZSB3aGVuIHRyYWNraW5nIGxpc3RlbmFibGUgdHJpZ2dlciBhcmd1bWVudHNcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBzdGF0aWMgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHN0b3JlIHdpdGggYSBqb2luIGxpc3RlbiBvbiB0aGUgZ2l2ZW4gbGlzdGVuYWJsZXMgdXNpbmcgdGhlIGdpdmVuIHN0cmF0ZWd5XG4gKi9cbmV4cG9ydHMuc3RhdGljSm9pbkNyZWF0b3IgPSBmdW5jdGlvbiAoc3RyYXRlZ3kpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkgLyogbGlzdGVuYWJsZXMuLi4gKi97XG4gICAgICAgIHZhciBsaXN0ZW5hYmxlcyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0b3JlKHtcbiAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgICAgICAgICAgdGhpc1tzdHJhdGVneU1ldGhvZE5hbWVzW3N0cmF0ZWd5XV0uYXBwbHkodGhpcywgbGlzdGVuYWJsZXMuY29uY2F0KFwidHJpZ2dlckFzeW5jXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn07XG5cbi8qKlxuICogVXNlZCBpbiBgTGlzdGVuZXJNZXRob2RzLmpzYCB0byBjcmVhdGUgdGhlIGluc3RhbmNlIGpvaW4gbWV0aG9kc1xuICogQHBhcmFtIHtTdHJpbmd9IHN0cmF0ZWd5IFdoaWNoIHN0cmF0ZWd5IHRvIHVzZSB3aGVuIHRyYWNraW5nIGxpc3RlbmFibGUgdHJpZ2dlciBhcmd1bWVudHNcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQW4gaW5zdGFuY2UgbWV0aG9kIHdoaWNoIHNldHMgdXAgYSBqb2luIGxpc3RlbiBvbiB0aGUgZ2l2ZW4gbGlzdGVuYWJsZXMgdXNpbmcgdGhlIGdpdmVuIHN0cmF0ZWd5XG4gKi9cbmV4cG9ydHMuaW5zdGFuY2VKb2luQ3JlYXRvciA9IGZ1bmN0aW9uIChzdHJhdGVneSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSAvKiBsaXN0ZW5hYmxlcy4uLiwgY2FsbGJhY2sqL3tcbiAgICAgICAgXy50aHJvd0lmKGFyZ3VtZW50cy5sZW5ndGggPCAyLCBcIkNhbm5vdCBjcmVhdGUgYSBqb2luIHdpdGggbGVzcyB0aGFuIDIgbGlzdGVuYWJsZXMhXCIpO1xuICAgICAgICB2YXIgbGlzdGVuYWJsZXMgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgICAgICBjYWxsYmFjayA9IGxpc3RlbmFibGVzLnBvcCgpLFxuICAgICAgICAgICAgbnVtYmVyT2ZMaXN0ZW5hYmxlcyA9IGxpc3RlbmFibGVzLmxlbmd0aCxcbiAgICAgICAgICAgIGpvaW4gPSB7XG4gICAgICAgICAgICBudW1iZXJPZkxpc3RlbmFibGVzOiBudW1iZXJPZkxpc3RlbmFibGVzLFxuICAgICAgICAgICAgY2FsbGJhY2s6IHRoaXNbY2FsbGJhY2tdIHx8IGNhbGxiYWNrLFxuICAgICAgICAgICAgbGlzdGVuZXI6IHRoaXMsXG4gICAgICAgICAgICBzdHJhdGVneTogc3RyYXRlZ3lcbiAgICAgICAgfSxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBjYW5jZWxzID0gW10sXG4gICAgICAgICAgICBzdWJvYmo7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1iZXJPZkxpc3RlbmFibGVzOyBpKyspIHtcbiAgICAgICAgICAgIF8udGhyb3dJZih0aGlzLnZhbGlkYXRlTGlzdGVuaW5nKGxpc3RlbmFibGVzW2ldKSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG51bWJlck9mTGlzdGVuYWJsZXM7IGkrKykge1xuICAgICAgICAgICAgY2FuY2Vscy5wdXNoKGxpc3RlbmFibGVzW2ldLmxpc3RlbihuZXdMaXN0ZW5lcihpLCBqb2luKSwgdGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIHJlc2V0KGpvaW4pO1xuICAgICAgICBzdWJvYmogPSB7IGxpc3RlbmFibGU6IGxpc3RlbmFibGVzIH07XG4gICAgICAgIHN1Ym9iai5zdG9wID0gbWFrZVN0b3BwZXIoc3Vib2JqLCBjYW5jZWxzLCB0aGlzKTtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zID0gKHRoaXMuc3Vic2NyaXB0aW9ucyB8fCBbXSkuY29uY2F0KHN1Ym9iaik7XG4gICAgICAgIHJldHVybiBzdWJvYmo7XG4gICAgfTtcbn07XG5cbi8vIC0tLS0gaW50ZXJuYWwgam9pbiBmdW5jdGlvbnMgLS0tLVxuXG5mdW5jdGlvbiBtYWtlU3RvcHBlcihzdWJvYmosIGNhbmNlbHMsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIHN1YnMgPSBjb250ZXh0LnN1YnNjcmlwdGlvbnMsXG4gICAgICAgICAgICBpbmRleCA9IHN1YnMgPyBzdWJzLmluZGV4T2Yoc3Vib2JqKSA6IC0xO1xuICAgICAgICBfLnRocm93SWYoaW5kZXggPT09IC0xLCBcIlRyaWVkIHRvIHJlbW92ZSBqb2luIGFscmVhZHkgZ29uZSBmcm9tIHN1YnNjcmlwdGlvbnMgbGlzdCFcIik7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYW5jZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjYW5jZWxzW2ldKCk7XG4gICAgICAgIH1cbiAgICAgICAgc3Vicy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIHJlc2V0KGpvaW4pIHtcbiAgICBqb2luLmxpc3RlbmFibGVzRW1pdHRlZCA9IG5ldyBBcnJheShqb2luLm51bWJlck9mTGlzdGVuYWJsZXMpO1xuICAgIGpvaW4uYXJncyA9IG5ldyBBcnJheShqb2luLm51bWJlck9mTGlzdGVuYWJsZXMpO1xufVxuXG5mdW5jdGlvbiBuZXdMaXN0ZW5lcihpLCBqb2luKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNhbGxhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICBpZiAoam9pbi5saXN0ZW5hYmxlc0VtaXR0ZWRbaV0pIHtcbiAgICAgICAgICAgIHN3aXRjaCAoam9pbi5zdHJhdGVneSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJpY3RcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RyaWN0IGpvaW4gZmFpbGVkIGJlY2F1c2UgbGlzdGVuZXIgdHJpZ2dlcmVkIHR3aWNlLlwiKTtcbiAgICAgICAgICAgICAgICBjYXNlIFwibGFzdFwiOlxuICAgICAgICAgICAgICAgICAgICBqb2luLmFyZ3NbaV0gPSBjYWxsYXJnczticmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiYWxsXCI6XG4gICAgICAgICAgICAgICAgICAgIGpvaW4uYXJnc1tpXS5wdXNoKGNhbGxhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGpvaW4ubGlzdGVuYWJsZXNFbWl0dGVkW2ldID0gdHJ1ZTtcbiAgICAgICAgICAgIGpvaW4uYXJnc1tpXSA9IGpvaW4uc3RyYXRlZ3kgPT09IFwiYWxsXCIgPyBbY2FsbGFyZ3NdIDogY2FsbGFyZ3M7XG4gICAgICAgIH1cbiAgICAgICAgZW1pdElmQWxsTGlzdGVuYWJsZXNFbWl0dGVkKGpvaW4pO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGVtaXRJZkFsbExpc3RlbmFibGVzRW1pdHRlZChqb2luKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBqb2luLm51bWJlck9mTGlzdGVuYWJsZXM7IGkrKykge1xuICAgICAgICBpZiAoIWpvaW4ubGlzdGVuYWJsZXNFbWl0dGVkW2ldKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgam9pbi5jYWxsYmFjay5hcHBseShqb2luLmxpc3RlbmVyLCBqb2luLmFyZ3MpO1xuICAgIHJlc2V0KGpvaW4pO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1peChkZWYpIHtcbiAgICB2YXIgY29tcG9zZWQgPSB7XG4gICAgICAgIGluaXQ6IFtdLFxuICAgICAgICBwcmVFbWl0OiBbXSxcbiAgICAgICAgc2hvdWxkRW1pdDogW11cbiAgICB9O1xuXG4gICAgdmFyIHVwZGF0ZWQgPSAoZnVuY3Rpb24gbWl4RGVmKG1peGluKSB7XG4gICAgICAgIHZhciBtaXhlZCA9IHt9O1xuICAgICAgICBpZiAobWl4aW4ubWl4aW5zKSB7XG4gICAgICAgICAgICBtaXhpbi5taXhpbnMuZm9yRWFjaChmdW5jdGlvbiAoc3ViTWl4aW4pIHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZChtaXhlZCwgbWl4RGVmKHN1Yk1peGluKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBfLmV4dGVuZChtaXhlZCwgbWl4aW4pO1xuICAgICAgICBPYmplY3Qua2V5cyhjb21wb3NlZCkuZm9yRWFjaChmdW5jdGlvbiAoY29tcG9zYWJsZSkge1xuICAgICAgICAgICAgaWYgKG1peGluLmhhc093blByb3BlcnR5KGNvbXBvc2FibGUpKSB7XG4gICAgICAgICAgICAgICAgY29tcG9zZWRbY29tcG9zYWJsZV0ucHVzaChtaXhpbltjb21wb3NhYmxlXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWl4ZWQ7XG4gICAgfSkoZGVmKTtcblxuICAgIGlmIChjb21wb3NlZC5pbml0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdXBkYXRlZC5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICBjb21wb3NlZC5pbml0LmZvckVhY2goZnVuY3Rpb24gKGluaXQpIHtcbiAgICAgICAgICAgICAgICBpbml0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChjb21wb3NlZC5wcmVFbWl0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdXBkYXRlZC5wcmVFbWl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvc2VkLnByZUVtaXQucmVkdWNlKChmdW5jdGlvbiAoYXJncywgcHJlRW1pdCkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHByZUVtaXQuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld1ZhbHVlID09PSB1bmRlZmluZWQgPyBhcmdzIDogW25ld1ZhbHVlXTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyksIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChjb21wb3NlZC5zaG91bGRFbWl0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdXBkYXRlZC5zaG91bGRFbWl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICByZXR1cm4gIWNvbXBvc2VkLnNob3VsZEVtaXQuc29tZShmdW5jdGlvbiAoc2hvdWxkRW1pdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhc2hvdWxkRW1pdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBPYmplY3Qua2V5cyhjb21wb3NlZCkuZm9yRWFjaChmdW5jdGlvbiAoY29tcG9zYWJsZSkge1xuICAgICAgICBpZiAoY29tcG9zZWRbY29tcG9zYWJsZV0ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICB1cGRhdGVkW2NvbXBvc2FibGVdID0gY29tcG9zZWRbY29tcG9zYWJsZV1bMF07XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB1cGRhdGVkO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5jYXBpdGFsaXplID0gY2FwaXRhbGl6ZTtcbmV4cG9ydHMuY2FsbGJhY2tOYW1lID0gY2FsbGJhY2tOYW1lO1xuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuZXhwb3J0cy5vYmplY3QgPSBvYmplY3Q7XG5leHBvcnRzLmlzQXJndW1lbnRzID0gaXNBcmd1bWVudHM7XG5leHBvcnRzLnRocm93SWYgPSB0aHJvd0lmO1xuXG5mdW5jdGlvbiBjYXBpdGFsaXplKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSk7XG59XG5cbmZ1bmN0aW9uIGNhbGxiYWNrTmFtZShzdHJpbmcsIHByZWZpeCkge1xuICAgIHByZWZpeCA9IHByZWZpeCB8fCBcIm9uXCI7XG4gICAgcmV0dXJuIHByZWZpeCArIGV4cG9ydHMuY2FwaXRhbGl6ZShzdHJpbmcpO1xufVxuXG4vKlxuICogaXNPYmplY3QsIGV4dGVuZCwgaXNGdW5jdGlvbiwgaXNBcmd1bWVudHMgYXJlIHRha2VuIGZyb20gdW5kZXNjb3JlL2xvZGFzaCBpblxuICogb3JkZXIgdG8gcmVtb3ZlIHRoZSBkZXBlbmRlbmN5XG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgIHJldHVybiB0eXBlID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZSA9PT0gXCJvYmplY3RcIiAmJiAhIW9iajtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKG9iaikge1xuICAgIGlmICghaXNPYmplY3Qob2JqKSkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICB2YXIgc291cmNlLCBwcm9wO1xuICAgIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBmb3IgKHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHByb3ApO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3AsIHByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiO1xufVxuXG5leHBvcnRzLkV2ZW50RW1pdHRlciA9IHJlcXVpcmUoXCJldmVudGVtaXR0ZXIzXCIpO1xuXG5leHBvcnRzLm5leHRUaWNrID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgMCk7XG59O1xuXG5mdW5jdGlvbiBvYmplY3Qoa2V5cywgdmFscykge1xuICAgIHZhciBvID0ge30sXG4gICAgICAgIGkgPSAwO1xuICAgIGZvciAoOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBvW2tleXNbaV1dID0gdmFsc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIG87XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiBcImNhbGxlZVwiIGluIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT09IFwibnVtYmVyXCI7XG59XG5cbmZ1bmN0aW9uIHRocm93SWYodmFsLCBtc2cpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICAgIHRocm93IEVycm9yKG1zZyB8fCB2YWwpO1xuICAgIH1cbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJ3JlZmx1eC1jb3JlL2xpYi91dGlscycpLFxuICAgIExpc3RlbmVyTWV0aG9kcyA9IHJlcXVpcmUoJ3JlZmx1eC1jb3JlL2xpYi9MaXN0ZW5lck1ldGhvZHMnKTtcblxuLyoqXG4gKiBBIG1vZHVsZSBtZWFudCB0byBiZSBjb25zdW1lZCBhcyBhIG1peGluIGJ5IGEgUmVhY3QgY29tcG9uZW50LiBTdXBwbGllcyB0aGUgbWV0aG9kcyBmcm9tXG4gKiBgTGlzdGVuZXJNZXRob2RzYCBtaXhpbiBhbmQgdGFrZXMgY2FyZSBvZiB0ZWFyZG93biBvZiBzdWJzY3JpcHRpb25zLlxuICogTm90ZSB0aGF0IGlmIHlvdSdyZSB1c2luZyB0aGUgYGNvbm5lY3RgIG1peGluIHlvdSBkb24ndCBuZWVkIHRoaXMgbWl4aW4sIGFzIGNvbm5lY3Qgd2lsbFxuICogaW1wb3J0IGV2ZXJ5dGhpbmcgdGhpcyBtaXhpbiBjb250YWlucyFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfLmV4dGVuZCh7XG5cbiAgICAvKipcbiAgICAgKiBDbGVhbnMgdXAgYWxsIGxpc3RlbmVyIHByZXZpb3VzbHkgcmVnaXN0ZXJlZC5cbiAgICAgKi9cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogTGlzdGVuZXJNZXRob2RzLnN0b3BMaXN0ZW5pbmdUb0FsbFxuXG59LCBMaXN0ZW5lck1ldGhvZHMpO1xuIiwidmFyIExpc3RlbmVyTWV0aG9kcyA9IHJlcXVpcmUoJ3JlZmx1eC1jb3JlL2xpYi9MaXN0ZW5lck1ldGhvZHMnKSxcbiAgICBMaXN0ZW5lck1peGluID0gcmVxdWlyZSgnLi9MaXN0ZW5lck1peGluJyksXG4gICAgXyA9IHJlcXVpcmUoJ3JlZmx1eC1jb3JlL2xpYi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3RlbmFibGUsIGtleSkge1xuXG4gICAgXy50aHJvd0lmKHR5cGVvZihrZXkpID09PSAndW5kZWZpbmVkJywgJ1JlZmx1eC5jb25uZWN0KCkgcmVxdWlyZXMgYSBrZXkuJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24obGlzdGVuYWJsZS5nZXRJbml0aWFsU3RhdGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gXy5vYmplY3QoW2tleV0sW2xpc3RlbmFibGUuZ2V0SW5pdGlhbFN0YXRlKCldKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG1lID0gdGhpcztcblxuICAgICAgICAgICAgXy5leHRlbmQobWUsIExpc3RlbmVyTWV0aG9kcyk7XG5cbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG8obGlzdGVuYWJsZSwgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIG1lLnNldFN0YXRlKF8ub2JqZWN0KFtrZXldLFt2XSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBMaXN0ZW5lck1peGluLmNvbXBvbmVudFdpbGxVbm1vdW50XG4gICAgfTtcbn07XG4iLCJ2YXIgTGlzdGVuZXJNZXRob2RzID0gcmVxdWlyZSgncmVmbHV4LWNvcmUvbGliL0xpc3RlbmVyTWV0aG9kcycpLFxuICAgIExpc3RlbmVyTWl4aW4gPSByZXF1aXJlKCcuL0xpc3RlbmVyTWl4aW4nKSxcbiAgICBfID0gcmVxdWlyZSgncmVmbHV4LWNvcmUvbGliL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdGVuYWJsZSwga2V5LCBmaWx0ZXJGdW5jKSB7XG5cbiAgICBfLnRocm93SWYoXy5pc0Z1bmN0aW9uKGtleSksICdSZWZsdXguY29ubmVjdEZpbHRlcigpIHJlcXVpcmVzIGEga2V5LicpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKGxpc3RlbmFibGUuZ2V0SW5pdGlhbFN0YXRlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmlsdGVyIGluaXRpYWwgcGF5bG9hZCBmcm9tIHN0b3JlLlxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZpbHRlckZ1bmMuY2FsbCh0aGlzLCBsaXN0ZW5hYmxlLmdldEluaXRpYWxTdGF0ZSgpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YocmVzdWx0KSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5vYmplY3QoW2tleV0sIFtyZXN1bHRdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzO1xuXG4gICAgICAgICAgICBfLmV4dGVuZCh0aGlzLCBMaXN0ZW5lck1ldGhvZHMpO1xuXG4gICAgICAgICAgICB0aGlzLmxpc3RlblRvKGxpc3RlbmFibGUsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZpbHRlckZ1bmMuY2FsbChtZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIG1lLnNldFN0YXRlKF8ub2JqZWN0KFtrZXldLCBbcmVzdWx0XSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBMaXN0ZW5lck1peGluLmNvbXBvbmVudFdpbGxVbm1vdW50XG4gICAgfTtcbn07XG4iLCJ2YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4LWNvcmUnKTtcblxuUmVmbHV4LmNvbm5lY3QgPSByZXF1aXJlKCcuL2Nvbm5lY3QnKTtcblxuUmVmbHV4LmNvbm5lY3RGaWx0ZXIgPSByZXF1aXJlKCcuL2Nvbm5lY3RGaWx0ZXInKTtcblxuUmVmbHV4Lkxpc3RlbmVyTWl4aW4gPSByZXF1aXJlKCcuL0xpc3RlbmVyTWl4aW4nKTtcblxuUmVmbHV4Lmxpc3RlblRvID0gcmVxdWlyZSgnLi9saXN0ZW5UbycpO1xuXG5SZWZsdXgubGlzdGVuVG9NYW55ID0gcmVxdWlyZSgnLi9saXN0ZW5Ub01hbnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWZsdXg7XG4iLCJ2YXIgTGlzdGVuZXJNZXRob2RzID0gcmVxdWlyZSgncmVmbHV4LWNvcmUvbGliL0xpc3RlbmVyTWV0aG9kcycpO1xuXG4vKipcbiAqIEEgbWl4aW4gZmFjdG9yeSBmb3IgYSBSZWFjdCBjb21wb25lbnQuIE1lYW50IGFzIGEgbW9yZSBjb252ZW5pZW50IHdheSBvZiB1c2luZyB0aGUgYExpc3RlbmVyTWl4aW5gLFxuICogd2l0aG91dCBoYXZpbmcgdG8gbWFudWFsbHkgc2V0IGxpc3RlbmVycyBpbiB0aGUgYGNvbXBvbmVudERpZE1vdW50YCBtZXRob2QuXG4gKlxuICogQHBhcmFtIHtBY3Rpb258U3RvcmV9IGxpc3RlbmFibGUgQW4gQWN0aW9uIG9yIFN0b3JlIHRoYXQgc2hvdWxkIGJlXG4gKiAgbGlzdGVuZWQgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGV2ZW50IGhhbmRsZXJcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBkZWZhdWx0Q2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGRlZmF1bHQgaGFuZGxlclxuICogQHJldHVybnMge09iamVjdH0gQW4gb2JqZWN0IHRvIGJlIHVzZWQgYXMgYSBtaXhpbiwgd2hpY2ggc2V0cyB1cCB0aGUgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBsaXN0ZW5hYmxlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3RlbmFibGUsY2FsbGJhY2ssaW5pdGlhbCl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCB1cCB0aGUgbWl4aW4gYmVmb3JlIHRoZSBpbml0aWFsIHJlbmRlcmluZyBvY2N1cnMuIEltcG9ydCBtZXRob2RzIGZyb20gYExpc3RlbmVyTWV0aG9kc2BcbiAgICAgICAgICogYW5kIHRoZW4gbWFrZSB0aGUgY2FsbCB0byBgbGlzdGVuVG9gIHdpdGggdGhlIGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZmFjdG9yeSBmdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9yKHZhciBtIGluIExpc3RlbmVyTWV0aG9kcyl7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXNbbV0gIT09IExpc3RlbmVyTWV0aG9kc1ttXSl7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzW21dKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ2FuJ3QgaGF2ZSBvdGhlciBwcm9wZXJ0eSAnXCIrbStcIicgd2hlbiB1c2luZyBSZWZsdXgubGlzdGVuVG8hXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpc1ttXSA9IExpc3RlbmVyTWV0aG9kc1ttXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxpc3RlblRvKGxpc3RlbmFibGUsY2FsbGJhY2ssaW5pdGlhbCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbGVhbnMgdXAgYWxsIGxpc3RlbmVyIHByZXZpb3VzbHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBMaXN0ZW5lck1ldGhvZHMuc3RvcExpc3RlbmluZ1RvQWxsXG4gICAgfTtcbn07XG4iLCJ2YXIgTGlzdGVuZXJNZXRob2RzID0gcmVxdWlyZSgncmVmbHV4LWNvcmUvbGliL0xpc3RlbmVyTWV0aG9kcycpO1xuXG4vKipcbiAqIEEgbWl4aW4gZmFjdG9yeSBmb3IgYSBSZWFjdCBjb21wb25lbnQuIE1lYW50IGFzIGEgbW9yZSBjb252ZW5pZW50IHdheSBvZiB1c2luZyB0aGUgYGxpc3RlbmVyTWl4aW5gLFxuICogd2l0aG91dCBoYXZpbmcgdG8gbWFudWFsbHkgc2V0IGxpc3RlbmVycyBpbiB0aGUgYGNvbXBvbmVudERpZE1vdW50YCBtZXRob2QuIFRoaXMgdmVyc2lvbiBpcyB1c2VkXG4gKiB0byBhdXRvbWF0aWNhbGx5IHNldCB1cCBhIGBsaXN0ZW5Ub01hbnlgIGNhbGwuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmFibGVzIEFuIG9iamVjdCBvZiBsaXN0ZW5hYmxlc1xuICogQHJldHVybnMge09iamVjdH0gQW4gb2JqZWN0IHRvIGJlIHVzZWQgYXMgYSBtaXhpbiwgd2hpY2ggc2V0cyB1cCB0aGUgbGlzdGVuZXJzIGZvciB0aGUgZ2l2ZW4gbGlzdGVuYWJsZXMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdGVuYWJsZXMpe1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgdXAgdGhlIG1peGluIGJlZm9yZSB0aGUgaW5pdGlhbCByZW5kZXJpbmcgb2NjdXJzLiBJbXBvcnQgbWV0aG9kcyBmcm9tIGBMaXN0ZW5lck1ldGhvZHNgXG4gICAgICAgICAqIGFuZCB0aGVuIG1ha2UgdGhlIGNhbGwgdG8gYGxpc3RlblRvYCB3aXRoIHRoZSBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGZhY3RvcnkgZnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvcih2YXIgbSBpbiBMaXN0ZW5lck1ldGhvZHMpe1xuICAgICAgICAgICAgICAgIGlmICh0aGlzW21dICE9PSBMaXN0ZW5lck1ldGhvZHNbbV0pe1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpc1ttXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkNhbid0IGhhdmUgb3RoZXIgcHJvcGVydHkgJ1wiK20rXCInIHdoZW4gdXNpbmcgUmVmbHV4Lmxpc3RlblRvTWFueSFcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzW21dID0gTGlzdGVuZXJNZXRob2RzW21dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG9NYW55KGxpc3RlbmFibGVzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsZWFucyB1cCBhbGwgbGlzdGVuZXIgcHJldmlvdXNseSByZWdpc3RlcmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50V2lsbFVubW91bnQ6IExpc3RlbmVyTWV0aG9kcy5zdG9wTGlzdGVuaW5nVG9BbGxcbiAgICB9O1xufTtcbiIsInZhciBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWZsdXguY3JlYXRlQWN0aW9ucyhbXG4gICdyZW1vdmVJdGVtJyxcbl0pO1xuIiwiLyoqXG4gKiBBU1UgRGVwYXJ0bWVudCBQaWNrZXIgQ29tcG9uZW50XG4gKi9cbnZhciAkID0galF1ZXJ5O1xudmFyIFJlZmx1eCA9IHJlcXVpcmUoJ3JlZmx1eCcpO1xudmFyIERlcHRMaXN0U3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvZGVwdC1saXN0LXN0b3JlJyk7XG5cblxudmFyIERlcHRUcmVlID0gcmVxdWlyZSgnLi9kZXB0LXRyZWUuanN4Jyk7XG52YXIgRGVwdExpc3QgPSByZXF1aXJlKCcuL2RlcHQtbGlzdC5qc3gnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgbWl4aW5zOiBbXG4gICAgUmVmbHV4Lmxpc3RlblRvKERlcHRMaXN0U3RvcmUsICdvbkRlcHRMaXN0SXRlbUNoYW5nZScpXG4gIF0sXG5cbiAgb25EZXB0TGlzdEl0ZW1DaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtKSB7XG4gICAgc3dpdGNoIChldmVudCkge1xuICAgICAgY2FzZSAncmVtb3ZlSXRlbSc6IHRoaXMuaGFuZGxlUmVtb3ZlSXRlbShpdGVtKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29uZmlnOiB7aXRlbXM6IFtdLCBvcHRpb25zOiB7fX0sXG4gICAgICBzZWxlY3RlZERlcGFydG1lbnRzOiBbXSxcbiAgICAgIGN1cnJlbnROb2RlOiBudWxsLFxuICAgICAgaW5jbHVkZVN1YmRlcHRzOiBmYWxzZSxcbiAgICAgIGluc3RhbmNlX2lkOiBNYXRoLnJhbmRvbSgpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vIEVzY2FwZSBzdXBwb3J0XG4gICAgJChkb2N1bWVudCkub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKGUua2V5Q29kZSA9PSAyNykge1xuICAgICAgICBpZiAoJCgnLmFzdS1kZXB0LXBpY2tlci1tb2RhbCcpLmhhcygnZGlhbG9nLW9wZW4nKSkge1xuICAgICAgICAgICQoJy5hc3UtZGVwdC1waWNrZXItbW9kYWwnKS5yZW1vdmVDbGFzcygnZGlhbG9nLW9wZW4nKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwid2lkZ2V0LWFzdS1kZXB0LXBpY2tlclwiPlxuICAgICAge3RoaXMucmVuZGVyQnJvd3NlQnV0dG9uKCl9XG4gICAgICB7dGhpcy5yZW5kZXJEZXBhcnRtZW50TGlzdCgpfVxuICAgICAge3RoaXMucmVuZGVyTW9kYWwoKX1cbiAgICA8L2Rpdj5cbiAgfSxcblxuICByZW5kZXJNb2RhbDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIDxkaXYgcmVmPVwibW9kYWxcIiBjbGFzc05hbWU9XCJhc3UtZGVwdC1waWNrZXItbW9kYWxcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGlhbG9nXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGlhbG9nLXRpdGxlXCI+XG4gICAgICAgICAge3RoaXMucHJvcHMudGl0bGUgfHwgXCJTZWxlY3QgRGVwYXJ0bWVudFwifVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2xvc2UtZGlhbG9nXCIgb25DbGljaz17dGhpcy5oYW5kbGVDYW5jZWxDbGlja30+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmYSBmYS1jbG9zZVwiPjwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxEZXB0VHJlZSByZWY9XCJkZXB0VHJlZVwiIHsuLi50aGlzLnByb3BzfVxuICAgICAgICAgIG9uVHJlZUNsaWNrPXt0aGlzLmhhbmRsZURlcHRUcmVlQ2xpY2t9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWN0aW9uc1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1pdGVtIGZvcm0tdHlwZS1jaGVja2JveFwiPlxuICAgICAgICAgICAgPGlucHV0IFxuICAgICAgICAgICAgICByZWY9XCJpbmNsdWRlX3N1YmRlcHRcIlxuICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmb3JtLWNoZWNrYm94XCJcbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVTdWJkZXB0Q2xpY2t9XG4gICAgICAgICAgICAgIGRlZmF1bHRDaGVja2VkPXt0aGlzLnN0YXRlLmluY2x1ZGVTdWJkZXB0cyA/ICdjaGVja2VkJyA6ICcnfVxuICAgICAgICAgICAgLz4gXG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwib3B0aW9uXCIgb25DbGljaz17dGhpcy5oYW5kbGVMYWJlbENsaWNrfT4gSW5jbHVkZSBzdWItZGVwYXJ0bWVudHM/PC9sYWJlbD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGVzY3JpcHRpb25cIiBzdHlsZT17eydkaXNwbGF5JzogJ25vbmUnfX0+XG4gICAgICAgICAgICAgIFRoaXMgd2lsbCBpbmNsdWRlIGFsbCBzdWItZGVwYXJ0bWVudHMgYmVuZWF0aCB0aGUgc2VsZWN0ZWQgZGVwYXJ0bWVudC5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImZvcm0tc3VibWl0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlU3VibWl0Q2xpY2t9XG4gICAgICAgICAgICB2YWx1ZT1cIlN1Ym1pdFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJmb3JtLXN1Ym1pdFwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZUNhbmNlbENsaWNrfVxuICAgICAgICAgICAgdmFsdWU9XCJDYW5jZWxcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIH0sXG5cbiAgcmVuZGVyRGVwYXJ0bWVudExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiA8RGVwdExpc3QgcmVmPVwiZGVwdExpc3RcIiBpdGVtcz17dGhpcy5zdGF0ZS5zZWxlY3RlZERlcGFydG1lbnRzfSAvPlxuICB9LFxuXG4gIHJlbmRlckJyb3dzZUJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwiYnJvd3NlLWJ1dHRvblwiPlxuICAgICAgPGlucHV0IHR5cGU9XCJidXR0b25cIlxuICAgICAgICB2YWx1ZT1cIkJyb3dzZVwiXG4gICAgICAgIGNsYXNzTmFtZT1cImZvcm0tc3VibWl0XCJcbiAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVCcm93c2VDbGlja31cbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gIH0sXG5cbiAgaGFuZGxlUmVtb3ZlSXRlbTogZnVuY3Rpb24oaXRlbSkge1xuICAgIC8vIGZpbHRlciBvdXQgdGhlIGl0ZW1cbiAgICBjb25zb2xlLmxvZygncmVtb3ZpbmcgaXRlbSEgJyArIHRoaXMuc3RhdGUuaW5zdGFuY2VfaWQpO1xuICB9LFxuXG4gIGhhbmRsZVN1YmRlcHRDbGljazogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGluY2x1ZGVTdWJkZXB0czogIXRoaXMuc3RhdGUuaW5jbHVkZVN1YmRlcHRzIH0pO1xuICB9LFxuXG4gIGhhbmRsZUxhYmVsQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICQodGhpcy5yZWZzLmluY2x1ZGVfc3ViZGVwdCkudHJpZ2dlcignY2xpY2snKTtcbiAgfSxcblxuICBoYW5kbGVDYW5jZWxDbGljazogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jbG9zZU1vZGFsKCk7XG4gIH0sXG5cbiAgaGFuZGxlU3VibWl0Q2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgIC8vIHNldHVwIGNvbmZpZ1xuICAgIHRoaXMuc2V0RGVwdENvbmZpZyh0aGlzLnJlZnMuZGVwdFRyZWUuc3RhdGUuY3VycmVudE5vZGUpO1xuICAgIC8vIHVwZGF0ZSBzZWxlY3RlZCBkZXBhcnRtZW50cyBsaXN0XG4gICAgdGhpcy5zZXRTZWxlY3RlZERlcGFydG1lbnRzKCk7XG4gICAgLy8gY2xvc2UgdGhlIG1vZGFsXG4gICAgdGhpcy5jbG9zZU1vZGFsKCk7XG4gIH0sXG5cbiAgaGFuZGxlQnJvd3NlQ2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy5vcGVuTW9kYWwoKTtcbiAgfSxcblxuICBoYW5kbGVEZXB0VHJlZUNsaWNrOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGN1cnJlbnROb2RlOiBkYXRhLm5vZGUgfSk7XG4gIH0sXG5cbiAgb3Blbk1vZGFsOiBmdW5jdGlvbigpIHtcbiAgICAkKHRoaXMucmVmcy5tb2RhbCkuYWRkQ2xhc3MoJ2RpYWxvZy1vcGVuJyk7XG4gIH0sXG5cbiAgY2xvc2VNb2RhbDogZnVuY3Rpb24oKSB7XG4gICAgJCh0aGlzLnJlZnMubW9kYWwpLnJlbW92ZUNsYXNzKCdkaWFsb2ctb3BlbicpO1xuICB9LFxuXG4gIHNldFNlbGVjdGVkRGVwYXJ0bWVudHM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZXB0VHJlZSA9IHRoaXMucmVmcy5kZXB0VHJlZTtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5zdGF0ZS5jb25maWc7XG4gICAgdmFyIGRlcHRzID0gW107XG5cbiAgICAkLmVhY2goY29uZmlnLml0ZW1zLCBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgZGVwdHMucHVzaCh7XG4gICAgICAgIGlkOiBpdGVtLmRlcHRfaWQsXG4gICAgICAgIHRpdGxlOiBkZXB0VHJlZS5nZXREZXB0UGF0aChpdGVtLnRpZClcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkRGVwYXJ0bWVudHM6IGRlcHRzIH0pO1xuICB9LFxuXG4gIHNldERlcHRDb25maWc6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyBnZXQgdGhlIHRyZWUgcGF0aCB0byBzZXQgdGhlIGxhYmVsXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMuc3RhdGUuY29uZmlnO1xuXG4gICAgdmFyIHVuaXF1ZSA9IHRydWU7XG4gICAgJC5lYWNoKGNvbmZpZy5pdGVtcywgZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLmRlcHRfbmlkID09IGRhdGEuZGVwdF9uaWQpIHtcbiAgICAgICAgdW5pcXVlID0gZmFsc2U7XG4gICAgICAgIC8vIHVwZGF0ZSBjb25maWd1cmF0aW9uXG4gICAgICAgIGNvbmZpZy5vcHRpb25zW2l0ZW0uZGVwdF9pZF0uc3ViZGVwdHMgPSB0aGlzLnN0YXRlLmluY2x1ZGVTdWJkZXB0cztcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgaWYgKHVuaXF1ZSkge1xuICAgICAgY29uZmlnLml0ZW1zLnB1c2goe1xuICAgICAgICAnZGVwdF9pZCc6IGRhdGEuZGVwdF9pZCxcbiAgICAgICAgJ2RlcHRfbmlkJzogZGF0YS5kZXB0X25pZCxcbiAgICAgICAgJ3RyZWVfbmlkcyc6IGRhdGEudHJlZV9uaWRzLFxuICAgICAgICAndGlkJzogZGF0YS50aWRcbiAgICAgIH0pO1xuXG4gICAgICBjb25maWcub3B0aW9uc1tkYXRhLmRlcHRfaWRdID0ge1xuICAgICAgICBzdWJkZXB0czogdGhpcy5zdGF0ZS5pbmNsdWRlU3ViZGVwdHNcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGNvbmZpZzogY29uZmlnIH0pO1xuICB9XG59KTtcbiIsIi8qKlxuICogQVNVIERlcGFydG1lbnQgTGlzdCBJdGVtIENvbXBvbmVudFxuICovXG52YXIgJCA9IGpRdWVyeTtcblxudmFyIFJlZmx1eCA9IHJlcXVpcmUoJ3JlZmx1eCcpO1xudmFyIEFjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL2RlcHQtbGlzdC1pdGVtLWFjdGlvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkXG4gICAgfVxuICB9LFxuXG4gIGhhbmRsZUl0ZW1SZW1vdmU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgQWN0aW9ucy5yZW1vdmVJdGVtKHRoaXMpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIDxsaSByZWY9XCJkZXB0XCI+XG4gICAgICB7dGhpcy5wcm9wcy50aXRsZX1cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRhZyByZW1vdmVcIj5cbiAgICAgICAgPHNwYW4gb25DbGljaz17dGhpcy5oYW5kbGVJdGVtUmVtb3ZlfSBjbGFzc05hbWU9XCJmYSBmYS1jbG9zZVwiPjwvc3Bhbj5cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2xpPlxuICB9XG59KTtcbiIsIi8qKlxuICogQVNVIERlcGFydG1lbnQgUGlja2VyIENvbXBvbmVudFxuICovXG52YXIgRGVwdExpc3RJdGVtID0gcmVxdWlyZSgnLi9kZXB0LWxpc3QtaXRlbScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXRlbXM6IHRoaXMucHJvcHMuaXRlbXMgfHwgW11cbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGl0ZW1zOiBuZXh0UHJvcHMuaXRlbXMgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gPHVsIGNsYXNzTmFtZT1cImFzdS1kZXB0LWxpc3RcIj5cbiAgICAgIHt0aGlzLnJlbmRlckxpc3QoKX1cbiAgICA8L3VsPlxuICB9LFxuXG4gIHJlbmRlckxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLml0ZW1zLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gPERlcHRMaXN0SXRlbSBrZXk9e2l0ZW0uaWR9IGlkPXtpdGVtLmlkfSB0aXRsZT17aXRlbS50aXRsZX0gLz5cbiAgICB9KTtcbiAgfSxcbn0pO1xuIiwidmFyICQgPSBqUXVlcnk7XG5cbi8qKlxuICogRGVwYXJ0bWVudCBUcmVlIENvbXBvbmVudFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHJlZURhdGE6IEpTT04ucGFyc2UodGhpcy5wcm9wcy50cmVlX2pzb25fZGF0YSksXG4gICAgICBjdXJyZW50Tm9kZToge1xuICAgICAgICBkZXB0X2lkOiAxMjM0LFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vIGluaXRpYWxpemUgdHJlZSBwbHVnaW4uLi5cbiAgICB2YXIgZWwgPSB0aGlzLnJlZnMudHJlZVdpZGdldDtcbiAgICB2YXIgdHJlZV9kYXRhID0gdGhpcy5zdGF0ZS50cmVlRGF0YTtcbiAgICB2YXIgdG9wTGV2ZWwgPSAxMDtcblxuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgIG9wZW5BdDogMSxcbiAgICAgIHNob3dPbmx5OiBudWxsLFxuICAgICAgYXV0b09wZW46IDBcbiAgICB9O1xuICAgIG9wdGlvbnMgPSAkLmV4dGVuZChkZWZhdWx0cywgdGhpcy5wcm9wcyk7XG5cbiAgICAkKGVsKS50cmVlKHtcbiAgICAgIGRhdGE6IHRyZWVfZGF0YSxcbiAgICAgIGNsb3NlZEljb246ICQoJzxzcGFuIGNsYXNzPVwiZmEgZmEtcGx1cy1jaXJjbGVcIj48L3NwYW4+JyksXG4gICAgICBvcGVuZWRJY29uOiAkKCc8c3BhbiBjbGFzcz1cImZhIGZhLW1pbnVzLWNpcmNsZVwiPjwvc3Bhbj4nKSxcblxuICAgICAgLy8gRmlyc3QgbGV2ZWwgb3BlblxuICAgICAgYXV0b09wZW46IG9wdGlvbnMuYXV0b09wZW4sXG4gICAgICBzZWxlY3RhYmxlOiB0cnVlLFxuXG4gICAgICAvLyBBc3NpZ24gZGVwdF9pZCBhdHRyaWJ1dGUgdG8gZWFjaCB0cmVlIDxsaT5cbiAgICAgIG9uQ3JlYXRlTGk6IGZ1bmN0aW9uIChub2RlLCAkbGkpIHtcbiAgICAgICAgJGxpLmF0dHIoJ2RlcHRfbmlkJywgbm9kZS5kZXB0X25pZCk7XG4gICAgICAgICRsaS5hdHRyKCdkZXB0X2lkJywgbm9kZS5kZXB0X2lkKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5zaG93T25seSAmJiBBcnJheS5pc0FycmF5KG9wdGlvbnMuc2hvd09ubHkpICYmIG9wdGlvbnMuc2hvd09ubHkubGVuZ3RoKSB7XG4gICAgICAgICAgJChlbCkuYWRkQ2xhc3MoJ3RyaW1tZWQnKTtcblxuICAgICAgICAgICQuZWFjaChvcHRpb25zLnNob3dPbmx5LCBmdW5jdGlvbihpbmRleCwgaXRlbSl7XG4gICAgICAgICAgICBpZiAoaXRlbSA9PSBub2RlLmRlcHRfbmlkIHx8IG5vZGUuZGVwdF9pZCA9PSAnQVNVJykge1xuICAgICAgICAgICAgICAkbGkuYWRkQ2xhc3MoJ3Zpc2libGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbm9kZS5oYXNDaGlsZHJlbigpKSB7XG4gICAgICAgICAgJGxpLmZpbmQoJy5qcXRyZWUtZWxlbWVudCcpLnByZXBlbmQoJzxzcGFuIGNsYXNzPVwianF0cmVlLWZvbGRlci1pY29uIGZhIGZhLWJvb2ttYXJrXCI+PC9zcGFuPicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkKGVsKS5iaW5kKCd0cmVlLmNsaWNrJywgdGhpcy5vblRyZWVDbGljayk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwiYXN1LWRlcHQtdHJlZVwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0cmVlLXdyYXBwZXJcIiByZWY9XCJ0cmVlV2lkZ2V0XCI+VHJlZSB3aWRnZXQ8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgfSxcbiAgb25UcmVlQ2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQubm9kZS50cmVlX25pZHMgPSB0aGlzLmdldFRyZWVJZHMoZXZlbnQubm9kZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGN1cnJlbnROb2RlOiBldmVudC5ub2RlIH0pO1xuICAgIHRoaXMucHJvcHMub25UcmVlQ2xpY2soZXZlbnQpO1xuICB9LFxuICBnZXREZXB0UGF0aDogZnVuY3Rpb24oZGVwdF90aWQsIHBhdGgsIHJldmVyc2UpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMTogcGF0aCA9IFtdO1xuICAgICAgY2FzZSAyOiByZXZlcnNlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoaXRlbSA9IHRoaXMuZmluZFJvb3REZXB0KGRlcHRfdGlkLCAndGlkJykpIHtcblxuICAgICAgdmFyIGNsYXNzTmFtZSA9IFsnZnJhZ21lbnQnXTtcblxuICAgICAgaWYgKGl0ZW0ucGFyZW50c1swXSA9PSAnMCcpIHtcbiAgICAgICAgLy8gYWJicmV2aWF0ZSBBcml6b25hIFN0YXRlIFVuaXZlcnNpdHlcbiAgICAgICAgaXRlbS5uYW1lID0gJ0FTVSc7XG4gICAgICAgIGNsYXNzTmFtZS5wdXNoKCdmaXJzdCcpO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW0uY2hpbGRyZW4ubGVuZ3RoID09IDApIHtcbiAgICAgICAgY2xhc3NOYW1lLnB1c2goJ2xhc3QnKTtcbiAgICAgIH1cblxuICAgICAgcGF0aC5wdXNoKDxzcGFuIGtleT17ZGVwdF90aWR9IGNsYXNzTmFtZT17Y2xhc3NOYW1lLmpvaW4oJyAnKX0+e2l0ZW0ubmFtZX08L3NwYW4+KTtcbiAgICAgIGlmIChpdGVtLnBhcmVudHMubGVuZ3RoKSB7XG4gICAgICAgIHBhdGggPSB0aGlzLmdldERlcHRQYXRoKGl0ZW0ucGFyZW50c1swXSwgcGF0aCwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICBwYXRoID0gcGF0aC5yZXZlcnNlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGg7XG4gIH0sXG4gIGdldFRyZWVJZHM6IGZ1bmN0aW9uKHRyZWUsIHRyZWVfaWRzKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSkge1xuICAgICAgdHJlZV9pZHMgPSBbXTtcbiAgICB9XG5cbiAgICB0cmVlX2lkcy5wdXNoKHRyZWUuZGVwdF9uaWQpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmVlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmdldFRyZWVJZHModHJlZS5jaGlsZHJlbltpXSwgdHJlZV9pZHMpO1xuICAgIH1cblxuICAgIHJldHVybiB0cmVlX2lkcztcbiAgfSxcbiAgZmluZFJvb3REZXB0OiBmdW5jdGlvbihkZXB0X2lkLCBpZF90eXBlLCBkYXRhKSB7XG4gICAgdmFyIGRlcHQgPSBudWxsO1xuXG4gICAgc3dpdGNoKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaWRfdHlwZSA9ICdkZXB0X25pZCc7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGRhdGEgPSB0aGlzLnN0YXRlLnRyZWVEYXRhO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBpZF90eXBlID0gJ2RlcHRfbmlkJztcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChkZXB0ID09IG51bGwgJiYgZGF0YVtpXSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChkYXRhW2ldW2lkX3R5cGVdID09IGRlcHRfaWQpIHtcbiAgICAgICAgICByZXR1cm4gZGF0YVtpXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkYXRhW2ldLmhhc093blByb3BlcnR5KCdjaGlsZHJlbicpKSB7XG4gICAgICAgICAgZGVwdCA9IHRoaXMuZmluZFJvb3REZXB0KGRlcHRfaWQsIGlkX3R5cGUsIGRhdGFbaV0uY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZXB0O1xuICB9XG59KTtcblxuLyoqXG4gKiBTYXZlcyB0aGUgaWRzIG9mIGFsbCBkZXBhcnRtZW50cyB1bmRlciBjdXJyZW50bHkgc2VsZWN0ZWQgdHJlZSBvbiAjcGVvcGxlJ3MgZGF0YSBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fVxuICogIE5lc3RlZCBKU09OIG9iamVjdCB3aXRoIGRlcGFydG1lbnQgZGF0YVxuICovXG5mdW5jdGlvbiBhc3VfaXNlYXJjaF9kZXB0X2dldF90cmVlX2lkcyh0cmVlLCB0cmVlX2lkcykge1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcbiAgICB0cmVlX2lkcyA9IFtdO1xuICB9XG5cbiAgdHJlZV9pZHMucHVzaCh0cmVlLmRlcHRfbmlkKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRyZWUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBhc3VfaXNlYXJjaF9kZXB0X2dldF90cmVlX2lkcyh0cmVlLmNoaWxkcmVuW2ldLCB0cmVlX2lkcyk7XG4gIH1cblxuICByZXR1cm4gdHJlZV9pZHM7XG59XG5cbmZ1bmN0aW9uIGFzdV9pc2VhcmNoX2RlcHRfZ2V0X3RyZWVfcGF0aF9pZHModHJlZSwgZGVwdF9uaWQsIHRyZWVfcGF0aCkge1xuICBcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMikge1xuICAgIHZhciB0cmVlX3BhdGggPSBbXTtcbiAgfVxuXG4gIGlmIChpdGVtID0gYXN1X2lzZWFyY2hfZGVwdF9maW5kX3Jvb3QodHJlZSwgZGVwdF9uaWQsICdkZXB0X25pZCcpKSB7XG4gICAgdHJlZV9wYXRoLnB1c2goaXRlbS5kZXB0X25pZCk7XG4gICAgaWYgKGl0ZW0ucGFyZW50cy5sZW5ndGgpIHtcbiAgICAgIHZhciB0cmVlX2l0ZW0gPSBhc3VfaXNlYXJjaF9kZXB0X2ZpbmRfcm9vdCh0cmVlLCBpdGVtLnBhcmVudHNbMF0sICd0aWQnKTtcbiAgICAgIGlmICh0cmVlX2l0ZW0pIHtcbiAgICAgICAgYXN1X2lzZWFyY2hfZGVwdF9nZXRfdHJlZV9wYXRoX2lkcyh0cmVlLCB0cmVlX2l0ZW0uZGVwdF9uaWQsIHRyZWVfcGF0aCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRyZWVfcGF0aDtcbn0iLCIvKipcbiAqIERlcGFydG1lbnQgTGlzdCBEYXRhIFN0b3JlXG4gKi9cbnZhciBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKTtcbnZhciBEZXB0TGlzdEl0ZW1BY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9kZXB0LWxpc3QtaXRlbS1hY3Rpb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVmbHV4LmNyZWF0ZVN0b3JlKHtcbiAgbGlzdGVuYWJsZXM6IFtEZXB0TGlzdEl0ZW1BY3Rpb25zXSxcblxuICByZW1vdmVJdGVtOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgdGhpcy50cmlnZ2VyKCdyZW1vdmVJdGVtJywgaXRlbSk7XG4gIH1cblxufSk7XG4iXX0=
