import expect from 'expect'
import React, { Component, PropTypes, Children } from 'react'
import TestUtils from 'react-addons-test-utils'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import { connect, createStore, ActionFactory } from '../../src'

import { of } from 'rxjs/observable/of'
import { map } from 'rxjs/operator/map'

describe('React', () => {
  describe('connect', () => {
    class Passthrough extends Component {
      render() {
        return <div />
      }
    }

    class ProviderMock extends Component {
      static childContextTypes = {
        store: PropTypes.object.isRequired,
        actionFactory: PropTypes.object
      }
      getChildContext() {
        return {
          store: this.props.store,
          actionFactory: this.props.actionFactory
        }
      }

      render() {
        return Children.only(this.props.children)
      }
    }

    it('should receive the store in the context', () => {
      const store = Observable::of({})

      @connect()
      class Container extends Component {
        render() {
          return <Passthrough {...this.props} />
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container pass="through" />
        </ProviderMock>
      )

      const container = TestUtils.findRenderedComponentWithType(tree, Container)
      expect(container.context.store).toBe(store)
    })

    it('should pass state and props to the given component', () => {
      const store = Observable::of({
        foo: 'bar',
        baz: 42,
        hello: 'world'
      })

      @connect(({ foo, baz }) => ({ foo, baz }))
      class Container extends Component {
        render() {
          return <Passthrough {...this.props} />
        }
      }

      const container = TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container pass="through" baz={50} />
        </ProviderMock>
      )

      const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
      expect(stub.props.pass).toEqual('through')
      expect(stub.props.foo).toEqual('bar')
      expect(stub.props.baz).toEqual(42)
      expect(stub.props.hello).toEqual(undefined)
      expect(() =>
        TestUtils.findRenderedComponentWithType(container, Container)
      ).toNotThrow()
    })

    it('should subscribe class components to the store changes', () => {
      const increment$ = new Subject
      const reducer$ = increment$::map(amount => state => state + amount)
      const store = createStore(reducer$, Observable::of(0))

      @connect(state => ({ counter: state }) )
      class Container extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )

      const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      expect(stub.props.counter).toBe(0)
      increment$.next(1)
      expect(stub.props.counter).toBe(1)
      increment$.next(1)
      expect(stub.props.counter).toBe(2)
      increment$.complete()
    })

    it('should work with actions', () => {
      const actionFactory = new ActionFactory
      const reducer$ = actionFactory.get('increment')::map(amount => state => state + amount)
      const store = createStore(reducer$, Observable::of(0))

      @connect(state => ({ counter: state }), { increment: 'increment' })
      class Container extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <ProviderMock store={store} actionFactory={actionFactory}>
          <Container />
        </ProviderMock>
      )

      const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      expect(stub.props.counter).toBe(0)
      expect(stub.props.increment).toBeA(Function)
      actionFactory.get('increment').next(1)
      expect(stub.props.counter).toBe(1)
      actionFactory.get('increment').next(1)
      expect(stub.props.counter).toBe(2)
      actionFactory.get('increment').complete()
    })
  })
})
