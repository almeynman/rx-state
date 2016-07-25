import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import storeShape from '../utils/storeShape'
import actionFactoryShape from '../utils/actionFactoryShape'
import wrapActionNames from '../utils/wrapActionNames'

import { map } from 'rxjs/operator/map'

function connect(mapState = state => ({}), mapActions = actions => ({}), mergeProps, options = {}) {
  const { pure = true, withRef = false } = options
  return function wrapWithConnect(WrappedComponent) {
    return class Connect extends React.Component {
      static propTypes = {
        store: storeShape,
        actionFactory: actionFactoryShape
      }

      static contextTypes = {
        store: storeShape.isRequired,
        actionFactory: actionFactoryShape
      }

      constructor(props, context) {
        super(props, context)
        this.store = context.store
        this.actionFactory = context.actionFactory
        if (typeof mapActions === 'function') {
          this.actions = mapActions(this.actionFactory)
        } else {
          this.actions = wrapActionNames(mapActions, this.actionFactory)
        }
      }

      componentWillMount() {
        this.subscription = this.store::map(mapState).subscribe(
          state => this.setState(state)
        )
      }

      shouldComponentUpdate(nextProps, nextState) {
        return pure && shallowCompare(this, nextProps, nextState)
      }

      componentWillUnmount() {
        this.subscription.unsubscribe()
      }

      render() {
        if (withRef) {
          return (
            <WrappedComponent
              ref={el => this.component = el}
              {...this.props}
              {...this.actions}
              {...this.state}
            />
          )
        }
        return (
          <WrappedComponent
            {...this.props}
            {...this.actions}
            {...this.state}
          />
        )
      }
    }
  }
}

export default connect
