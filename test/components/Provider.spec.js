import expect from 'expect'
import React, { PropTypes, Component } from 'react'
import TestUtils from 'react-addons-test-utils'
import { Provider } from '../../src'
import Observable from 'rxjs/Observable'
import { of } from 'rxjs/observable/of'

describe('React', () => {
  describe('Provider', () => {
    class Child extends Component {

      render() {
        return <div />
      }
    }

    Child.contextTypes = {
      store: PropTypes.object.isRequired
    }

    it('should enforce a single child', () => {
      const store = Observable::of({})

      const propTypes = Provider.propTypes
      Provider.propTypes = {}

      try {
        expect(() => TestUtils.renderIntoDocument(
          <Provider store={store}>
            <div />
          </Provider>
        )).toNotThrow()

        expect(() => TestUtils.renderIntoDocument(
          <Provider store={store}></Provider>
        )).toThrow(/exactly one child/)
      } finally {
        Provider.propTypes = propTypes
      }
    })

    it('should add the store to the child context', () => {
      const store = Observable::of({})

      const spy = expect.spyOn(console, 'error')
      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Child />
        </Provider>
      )
      spy.destroy()
      expect(spy.calls.length).toBe(0)

      const child = TestUtils.findRenderedComponentWithType(tree, Child)
      expect(child.context.store).toBe(store)
    })

    it('should warn once receiving a new store in props', () => {
      const store1 = Observable::of(1)
      const store2 = Observable::of(2)
      const store3 = Observable::of(3)

      class ProviderContainer extends Component {
        constructor() {
          super()
          this.state = { store: store1 }
        }
        render() {
          return (
            <Provider store={this.state.store}>
              <Child />
            </Provider>
          )
        }
      }

      const container = TestUtils.renderIntoDocument(<ProviderContainer />)
      const child = TestUtils.findRenderedComponentWithType(container, Child)
      expect(child.context.store).toEqual(Observable::of(1))

      let spy = expect.spyOn(console, 'error')
      container.setState({ store: store2 })
      spy.destroy()

      expect(child.context.store).toEqual(Observable::of(1))
      expect(spy.calls.length).toBe(1)
      expect(spy.calls[0].arguments[0]).toBe(
        '<Provider> does not support changing `store` on the fly.'
      )

      spy = expect.spyOn(console, 'error')
      container.setState({ store: store3 })
      spy.destroy()

      expect(child.context.store).toEqual(Observable::of(1))
      expect(spy.calls.length).toBe(0)
    })
  })
})
