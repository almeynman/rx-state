'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Subject = require('rxjs/Subject');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ActionFactory = function () {
  function ActionFactory() {
    _classCallCheck(this, ActionFactory);

    this.actions = {};
  }

  _createClass(ActionFactory, [{
    key: 'get',
    value: function get(actionName) {
      var action = this.actions[actionName];

      if (action) {
        return action;
      }

      action = this.actions[actionName] = new _Subject.Subject();
      return action;
    }
  }, {
    key: 'list',
    value: function list(regex) {
      return Object.keys(this.actions).filter(function (actionName) {
        return actionName.match(regex);
      });
    }
  }]);

  return ActionFactory;
}();

exports["default"] = ActionFactory;