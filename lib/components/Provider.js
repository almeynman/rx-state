'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _storeShape = require('../utils/storeShape');

var _storeShape2 = _interopRequireDefault(_storeShape);

var _actionFactoryShape = require('../utils/actionFactoryShape');

var _actionFactoryShape2 = _interopRequireDefault(_actionFactoryShape);

var _warning = require('../utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var didWarnAboutReceivingStore = false;
function warnAboutReceivingStore() {
  if (didWarnAboutReceivingStore) {
    return;
  }
  didWarnAboutReceivingStore = true;

  (0, _warning2["default"])('<Provider> does not support changing `store` on the fly.');
}

var Provider = (_temp = _class = function (_Component) {
  _inherits(Provider, _Component);

  _createClass(Provider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      if (this.actionFactory) {
        return {
          store: this.store,
          actionFactory: this.actionFactory
        };
      }
      return { store: this.store };
    }
  }]);

  function Provider(props, context) {
    _classCallCheck(this, Provider);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Provider).call(this, props, context));

    _this.store = props.store;
    _this.actionFactory = props.actionFactory;
    return _this;
  }

  _createClass(Provider, [{
    key: 'render',
    value: function render() {
      return _react.Children.only(this.props.children);
    }
  }]);

  return Provider;
}(_react.Component), _class.propTypes = {
  store: _storeShape2["default"].isRequired,
  actionFactory: _actionFactoryShape2["default"],
  children: _react.PropTypes.element.isRequired
}, _class.childContextTypes = {
  store: _storeShape2["default"].isRequired,
  actionFactory: _actionFactoryShape2["default"]
}, _temp);
exports["default"] = Provider;


if (process.env.NODE_ENV !== 'production') {
  Provider.prototype.componentWillReceiveProps = function (nextProps) {
    var store = this.store;
    var nextStore = nextProps.store;


    if (store !== nextStore) {
      warnAboutReceivingStore();
    }
  };
}