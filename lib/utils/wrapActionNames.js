'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = wrapActionNames;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bindAction = require('../store/bindAction');

var _bindAction2 = _interopRequireDefault(_bindAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function wrapActionNames(actionNames, actionFactory) {
  if (_lodash2["default"].isPlainObject(actionNames)) {
    return _lodash2["default"].transform(actionNames, function (result, value, key) {
      var subject = value ? actionFactory.get(value) : actionFactory.get(key);
      result[key] = (0, _bindAction2["default"])(subject);
    }, {});
  }

  var result = {};
  actionNames.forEach(function (actionName) {
    return result[actionName] = (0, _bindAction2["default"])(actionFactory.get(actionName));
  });
  return result;
}