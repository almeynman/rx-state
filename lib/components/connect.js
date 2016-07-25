'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

var _storeShape = require('../utils/storeShape');

var _storeShape2 = _interopRequireDefault(_storeShape);

var _actionFactoryShape = require('../utils/actionFactoryShape');

var _actionFactoryShape2 = _interopRequireDefault(_actionFactoryShape);

var _wrapActionNames = require('../utils/wrapActionNames');

var _wrapActionNames2 = _interopRequireDefault(_wrapActionNames);

var _map = require('rxjs/operator/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function connect() {
  var mapState = arguments.length <= 0 || arguments[0] === undefined ? function (state) {
    return {};
  } : arguments[0];
  var mapActions = arguments.length <= 1 || arguments[1] === undefined ? function (actions) {
    return {};
  } : arguments[1];
  var mergeProps = arguments[2];
  var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
  var _options$pure = options.pure;
  var pure = _options$pure === undefined ? true : _options$pure;
  var _options$withRef = options.withRef;
  var withRef = _options$withRef === undefined ? false : _options$withRef;

  return function wrapWithConnect(WrappedComponent) {
    var _class, _temp;

    return _temp = _class = function (_React$Component) {
      _inherits(Connect, _React$Component);

      function Connect(props, context) {
        _classCallCheck(this, Connect);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Connect).call(this, props, context));

        _this.store = context.store;
        _this.actionFactory = context.actionFactory;
        if (typeof mapActions === 'function') {
          _this.actions = mapActions(_this.actionFactory);
        } else {
          _this.actions = (0, _wrapActionNames2["default"])(mapActions, _this.actionFactory);
        }
        return _this;
      }

      _createClass(Connect, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          var _context,
              _this2 = this;

          this.subscription = (_context = this.store, _map.map).call(_context, mapState).subscribe(function (state) {
            return _this2.setState(state);
          });
        }
      }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
          return pure && (0, _reactAddonsShallowCompare2["default"])(this, nextProps, nextState);
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.subscription.unsubscribe();
        }
      }, {
        key: 'render',
        value: function render() {
          var _this3 = this;

          if (withRef) {
            return _react2["default"].createElement(WrappedComponent, _extends({
              ref: function ref(el) {
                return _this3.component = el;
              }
            }, this.props, this.actions, this.state));
          }
          return _react2["default"].createElement(WrappedComponent, _extends({}, this.props, this.actions, this.state));
        }
      }]);

      return Connect;
    }(_react2["default"].Component), _class.propTypes = {
      store: _storeShape2["default"],
      actionFactory: _actionFactoryShape2["default"]
    }, _class.contextTypes = {
      store: _storeShape2["default"].isRequired,
      actionFactory: _actionFactoryShape2["default"]
    }, _temp;
  };
}

exports["default"] = connect;