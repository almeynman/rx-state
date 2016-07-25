'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _ActionFactory = require('../store/ActionFactory');

var _ActionFactory2 = _interopRequireDefault(_ActionFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

exports["default"] = _react.PropTypes.instanceOf(_ActionFactory2["default"]);