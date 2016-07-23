'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _warning = require('../utils/warning');

var _warning2 = _interopRequireDefault(_warning);

var _storeShape = require('../utils/storeShape');

var _storeShape2 = _interopRequireDefault(_storeShape);

var _shallowEqual = require('../utils/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _wrapActionNames = require('../utils/wrapActionNames');

var _wrapActionNames2 = _interopRequireDefault(_wrapActionNames);

var _map = require('rxjs/operator/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultMapStateToProps = function defaultMapStateToProps() {
  return {};
};
var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch) {
  return { dispatch: dispatch };
};
var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
  return _extends({}, parentProps, stateProps, dispatchProps);
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

// Helps track hot reloading.
var nextVersion = 0;

function connect(mapStateToProps, mapDispatchToProps, mergeProps) {
  var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  var shouldSubscribe = Boolean(mapStateToProps);
  var mapState = mapStateToProps || defaultMapStateToProps;
  var mapDispatch = void 0;

  var finalMergeProps = mergeProps || defaultMergeProps;
  var _options$pure = options.pure;
  var pure = _options$pure === undefined ? true : _options$pure;
  var _options$withRef = options.withRef;
  var withRef = _options$withRef === undefined ? false : _options$withRef;

  // Helps track hot reloading.

  var version = nextVersion++;

  return function wrapWithConnect(WrappedComponent) {
    var _class, _temp;

    var connectDisplayName = 'Connect(' + getDisplayName(WrappedComponent) + ')';

    function checkStateShape(props, methodName) {
      if (!(0, _isPlainObject2["default"])(props)) {
        (0, _warning2["default"])(methodName + '() in ' + connectDisplayName + ' must return a plain object. ' + ('Instead received ' + props + '.'));
      }
    }

    function computeMergedProps(stateProps, dispatchProps, parentProps) {
      var mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
      if (process.env.NODE_ENV !== 'production') {
        checkStateShape(mergedProps, 'mergeProps');
      }
      return mergedProps;
    }

    var Connect = (_temp = _class = function (_Component) {
      _inherits(Connect, _Component);

      function Connect(props, context) {
        _classCallCheck(this, Connect);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Connect).call(this, props, context));

        _this.store = props.store || context.store;

        (0, _invariant2["default"])(_this.store, 'Could not find "store" in either the context or ' + 'props of "${connectDisplayName}". ' + 'Either wrap the root component in a <Provider>, ' + 'or explicitly pass "store" as a prop to "${connectDisplayName}".');

        if (typeof mapDispatchToProps === 'function') {
          mapDispatch = mapDispatchToProps;
        } else if (!mapDispatchToProps) {
          mapDispatch = defaultMapDispatchToProps;
        } else {
          mapDispatch = (0, _wrapActionNames2["default"])(mapDispatchToProps, _this.store.actions);
        }

        _this.state = { storeState: {} };
        return _this;
      }

      _createClass(Connect, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          this.actions = mapDispatch(this.store.dispatch, this.props);
          this.actionsUpdated = true;
          this.trySubscribe();
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          console.log(this.wrappedComponent);
          if (!pure || mapState.length !== 1 && this.state) {
            this.state.storeState = mapState(this.state.storeState, nextProps);
          }

          if (!pure || mapDispatch.length !== 1 && !this.actionsUpdated) {
            this.actions = mapDispatch(this.store.dispatch, nextProps);
            this.actionsUpdated = true;
          }
        }
      }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
          return !pure || !(0, _shallowEqual2["default"])(this.props, nextProps) || !(0, _shallowEqual2["default"])(this.state.storeState, nextState.storeState);
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          if (this.subscription) {
            this.subscription.unsubscribe();
          }
        }
      }, {
        key: 'trySubscribe',
        value: function trySubscribe() {
          var _this2 = this;

          if (shouldSubscribe && !this.subscription) {
            var _context;

            this.subscription = (_context = this.store, _map.map).call(_context, function (subState) {
              return mapState(subState, _this2.props);
            }).subscribe(function (state) {
              return _this2.setState({ storeState: state });
            });
          }
          if (mapDispatch.length !== 1 && !this.actionsUpdated) {
            this.actions = mapDispatch(this.store.dispatch, this.props);
            this.actionsUpdated = true;
          }
        }
      }, {
        key: 'isSubscribed',
        value: function isSubscribed() {
          return !!this.subscription;
        }
      }, {
        key: 'getWrappedInstance',
        value: function getWrappedInstance() {
          (0, _invariant2["default"])(withRef, 'To access the wrapped instance, you need to specify ' + '{ withRef: true } as the fourth argument of the connect() call.');

          return this.wrappedInstance;
        }
      }, {
        key: 'render',
        value: function render() {
          var _this3 = this;

          this.actionsUpdated = false;

          if (process.env.NODE_ENV !== 'production') {
            checkStateShape(this.state.storeState, 'mapStateToProps');
          }

          if (process.env.NODE_ENV !== 'production') {
            checkStateShape(this.actions, 'mapDispatchToProps');
          }

          var mergedProps = computeMergedProps(this.state.storeState ? this.state.storeState : {}, this.actions, this.props);

          if (withRef) {
            this.renderedElement = (0, _react.createElement)(WrappedComponent, _extends({}, mergedProps, {
              ref: function ref(instance) {
                return _this3.wrappedInstance = instance;
              }
            }));
          } else {
            this.renderedElement = (0, _react.createElement)(WrappedComponent, _extends({}, mergedProps));
          }

          return this.renderedElement;
        }
      }]);

      return Connect;
    }(_react.Component), _class.displayName = connectDisplayName, _class.WrappedComponent = WrappedComponent, _class.propTypes = {
      store: _storeShape2["default"]
    }, _class.contextTypes = {
      store: _storeShape2["default"].isRequired
    }, _temp);


    if (process.env.NODE_ENV !== 'production') {
      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
        if (this.version === version) {
          return;
        }
        // We are hot reloading!
        this.version = version;
        this.trySubscribe();
      };
    }

    return (0, _hoistNonReactStatics2["default"])(Connect, WrappedComponent);
  };
}

exports["default"] = connect;