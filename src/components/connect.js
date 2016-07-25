import { Component, createElement } from 'react'
import invariant from 'invariant'
import hoistStatics from 'hoist-non-react-statics'
import isPlainObject from 'lodash/isPlainObject'
import warning from '../utils/warning'
import storeShape from '../utils/storeShape'
import shallowEqual from '../utils/shallowEqual'
import wrapActionNames from '../utils/wrapActionNames'

import { map } from 'rxjs/operator/map'

const defaultMapStateToProps = () => ({})
const defaultMapDispatchToProps = dispatch => ({ dispatch })
const defaultMergeProps = (stateProps, dispatchProps, parentProps) => ({
  ...parentProps,
  ...stateProps,
  ...dispatchProps
})

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

// Helps track hot reloading.
let nextVersion = 0

function connect(mapStateToProps, mapDispatchToProps, mergeProps, options = {}) {
  const shouldSubscribe = Boolean(mapStateToProps)
  const mapState = mapStateToProps || defaultMapStateToProps
  let mapDispatch

  const finalMergeProps = mergeProps || defaultMergeProps
  const { pure = true, withRef = false } = options

  // Helps track hot reloading.
  const version = nextVersion++

  return function wrapWithConnect(WrappedComponent) {
    const connectDisplayName = `Connect(${getDisplayName(WrappedComponent)})`

    function checkStateShape(props, methodName) {
      if (!isPlainObject(props)) {
        warning(
          `${methodName}() in ${connectDisplayName} must return a plain object. ` +
          `Instead received ${props}.`
        )
      }
    }

    function computeMergedProps(stateProps, dispatchProps, parentProps) {
      const mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps)
      if (process.env.NODE_ENV !== 'production') {
        checkStateShape(mergedProps, 'mergeProps')
      }
      return mergedProps
    }

    class Connect extends Component {
      static displayName = connectDisplayName
      static WrappedComponent = WrappedComponent

      static propTypes = {
        store: storeShape
      }

      static contextTypes = {
        store: storeShape.isRequired
      }

      constructor(props, context) {
        super(props, context)
        this.store = props.store || context.store

        invariant(this.store,
          'Could not find "store" in either the context or ' +
          'props of "${connectDisplayName}". ' +
          'Either wrap the root component in a <Provider>, ' +
          'or explicitly pass "store" as a prop to "${connectDisplayName}".'
        )

        if (typeof mapDispatchToProps === 'function') {
          mapDispatch = mapDispatchToProps
        } else if (!mapDispatchToProps) {
          mapDispatch = defaultMapDispatchToProps
        } else {
          mapDispatch = wrapActionNames(mapDispatchToProps, this.store.actions)
        }

        this.state = { storeState: {} }
      }

      componentWillMount() {
        this.actions = mapDispatch(this.store.dispatch, this.props)
        this.actionsUpdated = true
        this.trySubscribe()
      }

      componentWillReceiveProps(nextProps) {
        if (!pure || (mapState.length !== 1 && this.state)) {
          this.state.storeState = mapState(this.state.storeState, nextProps)
        }

        if (!pure || (mapDispatch.length !== 1 && !this.actionsUpdated)) {
          this.actions = mapDispatch(this.store.dispatch, nextProps)
          this.actionsUpdated = true
        }
      }

      shouldComponentUpdate(nextProps, nextState) {
        return !pure || !shallowEqual(this.props, nextProps) ||
          !shallowEqual(this.state.storeState, nextState.storeState)
      }

      componentWillUnmount() {
        if (this.subscription) {
          this.subscription.unsubscribe()
        }
      }

      trySubscribe() {
        if (shouldSubscribe && !this.subscription) {
          this.subscription = this.store::map(subState => mapState(subState, this.props)).subscribe(
            state => this.setState({ storeState: state })
          )
        }
        if (mapDispatch.length !== 1 && !this.actionsUpdated) {
          this.actions = mapDispatch(this.store.dispatch, this.props)
          this.actionsUpdated = true
        }
      }

      isSubscribed() {
        return !!this.subscription
      }

      getWrappedInstance() {
        invariant(withRef,
          'To access the wrapped instance, you need to specify ' +
          '{ withRef: true } as the fourth argument of the connect() call.'
        )

        return this.wrappedInstance
      }

      render() {
        this.actionsUpdated = false

        if (process.env.NODE_ENV !== 'production') {
          checkStateShape(this.state.storeState, 'mapStateToProps')
        }

        if (process.env.NODE_ENV !== 'production') {
          checkStateShape(this.actions, 'mapDispatchToProps')
        }

        const mergedProps = computeMergedProps(
          this.state.storeState ? this.state.storeState : {},
          this.actions,
          this.props
        )

        if (withRef) {
          this.renderedElement = createElement(WrappedComponent, {
            ...mergedProps,
            ref: instance => this.wrappedInstance = instance
          })
        } else {
          this.renderedElement = createElement(WrappedComponent, {
            ...mergedProps
          })
        }

        return this.renderedElement
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
        if (this.version === version) {
          return
        }
        // We are hot reloading!
        this.version = version
        this.trySubscribe()
      }
    }

    return hoistStatics(Connect, WrappedComponent)
  }
}

export default connect
