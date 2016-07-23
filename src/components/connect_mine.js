import { Component, createElement } from 'react'
import invariant from 'invariant'
import isPlainObject from 'lodash/isPlainObject'
import warning from '../utils/warning'
import storeShape from '../utils/storeShape'
import shallowEqual from '../utils/shallowEqual'

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


let errorObject = { value: null }
function tryCatch(fn, ctx) {
  try {
    return fn.apply(ctx)
  } catch (e) {
    errorObject.value = e
    return errorObject
  }
}

function connect(mapStateToProps, mapDispatchToProps, mergeProps, options = {}) {
  const shouldSubscribe = Boolean(mapStateToProps)
  const mapState = mapStateToProps || defaultMapStateToProps

  let mapDispatch
  if (typeof mapDispatchToProps === 'function') {
    mapDispatch = mapDispatchToProps
  } else if (!mapDispatchToProps) {
    mapDispatch = defaultMapDispatchToProps
  } else {
    mapDispatch = wrapActionNames(mapDispatchToProps)
  }

  const finalMergeProps = mergeProps || defaultMergeProps
  const { pure = true, withRef = false } = options

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

    return class Connect extends Component {
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
      }

      componentWillMount() {
        if (shouldSubscribe) {
          this.subscription = this.store::map(subState => mapState(subState, this.props)).subscribe(
            state => this.setState({ storeState: state })
          )
        }
        this.actions = mapDispatch()
      }

      componentWillReceiveProps(nextProps) {
        if (mapState.length !== 1 && this.state) {
          this.state.storeState = mapState(this.state.storeState, nextProps)
        }

        if (mapDispatch.length !== 1) {
          this.actions = mapDispatch(this.store.dispatch, nextProps)
        }
      }

      shouldComponentUpdate(nextProps, nextState) {
        return !pure || !shallowEqual(this.props, nextProps) || !shallowEqual(this.state.storeState, nextState.storeState)
      }

      componentWillUnmount() {
        if (this.subscription) {
          this.subscription.unsubscribe()
        }
      }

      isSubscribed() {
        return !!this.subscription
      }

      render() {
        if (haveMergeProps)
        const mergedProps = computeMergedProps(this.state ? this.state.storeState : {}, this.actions, this.props)
        if (withRef) {
          this.renderedElement = createElement(WrappedComponent, {
            ...mergedProps
          })
        } else {
          this.renderedElement = createElement(WrappedComponent,
            mergedProps
          )
        }
        return this.renderedElement
      }
    }
  }
}

export default connect
