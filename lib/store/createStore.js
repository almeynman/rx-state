'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Observable = require('rxjs/Observable');

var _of = require('rxjs/observable/of');

var _merge = require('rxjs/operator/merge');

var _scan = require('rxjs/operator/scan');

var _publishReplay = require('rxjs/operator/publishReplay');

var createStore = function createStore(reducer$) {
  var _context;

  var initialState$ = arguments.length <= 1 || arguments[1] === undefined ? _of.of.call(_Observable.Observable, {}) : arguments[1];
  return (_context = (_context = _merge.merge.call(initialState$, reducer$), _scan.scan).call(_context, function (state, reducer) {
    return reducer(state);
  }), _publishReplay.publishReplay).call(_context, 1).refCount();
};

exports["default"] = createStore;