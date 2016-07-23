import expect from 'expect'
import React, { Component, PropTypes, Children, createClass } from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import { connect, createStore } from '../../src'

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
        store: PropTypes.object.isRequired
      }
      getChildContext() {
        return { store: this.props.store }
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
      const reducer$ = new Subject
      const reducer = state => state + 1
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
      reducer$.next(reducer)
      expect(stub.props.counter).toBe(1)
      reducer$.next(reducer)
      expect(stub.props.counter).toBe(2)
      reducer$.complete()
    })

    it('should subscribe pure function components to the store changes', () => {
      const reducer$ = new Subject
      const reducer = state => state + 1
      const store = createStore(reducer$, Observable::of(0))

      const Container = connect(
        state => ({ counter: state })
      )(function Container(props) {
        return <Passthrough {...props}/>
      })

      const spy = expect.spyOn(console, 'error')
      const tree = TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )
      spy.destroy()
      expect(spy.calls.length).toBe(0)

      const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      expect(stub.props.counter).toBe(0)
      reducer$.next(reducer)
      expect(stub.props.counter).toBe(1)
      reducer$.next(reducer)
      expect(stub.props.counter).toBe(2)
      reducer$.complete()
    })

    it('should handle dispatches before componentDidMount', () => {
      const reducer$ = new Subject
      const reducer = state => state + 1
      const store = createStore(reducer$, Observable::of(0))

      @connect(state => ({ counter: state }) )
      class Container extends Component {
        componentWillMount() {
          reducer$.next(reducer)
        }

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
      expect(stub.props.counter).toBe(1)
    })

    it('should handle additional prop changes in addition to slice', () => {
      const store = Observable::of({
        foo: 'bar'
      })

      @connect(state => state)
      class ConnectContainer extends Component {
        render() {
          return (
            <Passthrough {...this.props} pass={this.props.bar.baz} />
          )
        }
      }

      class Container extends Component {
        constructor() {
          super()
          this.state = {
            bar: {
              baz: ''
            }
          }
        }

        componentDidMount() {
          this.setState({
            bar: Object.assign({}, this.state.bar, { baz: 'through' })
          })
        }

        render() {
          return (
            <ProviderMock store={store}>
              <ConnectContainer bar={this.state.bar} />
             </ProviderMock>
          )
        }
      }

      const container = TestUtils.renderIntoDocument(<Container />)
      const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
      expect(stub.props.foo).toEqual('bar')
      expect(stub.props.pass).toEqual('through')
    })

    it('should handle unexpected prop changes with forceUpdate()', () => {
      const store = Observable::of({})

      @connect(state => state)
      class ConnectContainer extends Component {
        render() {
          return (
            <Passthrough {...this.props} pass={this.props.bar} />
          )
        }
      }

      class Container extends Component {
        constructor() {
          super()
          this.bar = 'baz'
        }

        componentDidMount() {
          this.bar = 'foo'
          this.forceUpdate()
          this.c.forceUpdate()
        }

        render() {
          return (
            <ProviderMock store={store}>
              <ConnectContainer bar={this.bar} ref={c => this.c = c} />
            </ProviderMock>
          )
        }
      }

      const container = TestUtils.renderIntoDocument(<Container />)
      const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
      expect(stub.props.bar).toEqual('foo')
    })

    it('should remove undefined props', () => {
      const store = Observable::of({})
      let props = { x: true }
      let container

      @connect(() => ({}), () => ({}))
      class ConnectContainer extends Component {
        render() {
          return (
            <Passthrough {...this.props} />
          )
        }
      }

      class HolderContainer extends Component {
        render() {
          return (
            <ConnectContainer {...props} />
          )
        }
      }

      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <HolderContainer ref={instance => container = instance} />
        </ProviderMock>
      )

      const propsBefore = {
        ...TestUtils.findRenderedComponentWithType(container, Passthrough).props
      }

      props = {}
      container.forceUpdate()

      const propsAfter = {
        ...TestUtils.findRenderedComponentWithType(container, Passthrough).props
      }

      expect(propsBefore.x).toEqual(true)
      expect('x' in propsAfter).toEqual(false, 'x prop must be removed')
    })

    it('should remove undefined props without mismatch', () => {
      const store = Observable::of({})
      let props = { x: true }
      let container

      @connect(() => ({}))
      class ConnectContainer extends Component {
        render() {
          return (
            <Passthrough {...this.props} />
          )
        }
      }

      class HolderContainer extends Component {
        render() {
          return (
            <ConnectContainer {...props} />
          )
        }
      }

      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <HolderContainer ref={instance => container = instance} />
        </ProviderMock>
      )

      const propsBefore = {
        ...TestUtils.findRenderedComponentWithType(container, Passthrough).props
      }

      props = {}
      container.forceUpdate()

      const propsAfter = {
        ...TestUtils.findRenderedComponentWithType(container, Passthrough).props
      }

      expect(propsBefore.x).toEqual(true)
      expect('x' in propsAfter).toEqual(false, 'x prop must be removed')
    })

    it('should ignore deep mutations in props', () => {
      const store = Observable::of({
        foo: 'bar'
      })

      @connect(state => state)
      class ConnectContainer extends Component {
        render() {
          return (
            <Passthrough {...this.props} pass={this.props.bar.baz} />
          )
        }
      }

      class Container extends Component {
        constructor() {
          super()
          this.state = {
            bar: {
              baz: ''
            }
          }
        }

        componentDidMount() {
          // Simulate deep object mutation
          this.state.bar.baz = 'through'
          this.setState({
            bar: this.state.bar
          })
        }

        render() {
          return (
            <ProviderMock store={store}>
              <ConnectContainer bar={this.state.bar} />
            </ProviderMock>
          )
        }
      }

      const container = TestUtils.renderIntoDocument(<Container />)
      const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
      expect(stub.props.foo).toEqual('bar')
      expect(stub.props.pass).toEqual('')
    })

    it('should allow for merge to incorporate state and prop changes', () => {
      const append$ = new Subject
      const reducer$ = append$::map(str => state => state + str)
      const store = createStore(reducer$, Observable::of(''))

      @connect(
        state => ({ text: state }),
        () => ({
          append: whatever => append$.next(whatever)
        }),
        (stateProps, actionProps, parentProps) => ({
          ...stateProps,
          ...actionProps,
          mergedAppend(str) {
            const seed = stateProps.text === '' ? 'HELLO ' : ''
            actionProps.append(seed + str + parentProps.extra)
          }
        })
      )
      class Container extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterContainer extends Component {
        constructor() {
          super()
          this.state = { extra: 'z' }
        }

        render() {
          return (
            <ProviderMock store={store}>
              <Container extra={this.state.extra} />
            </ProviderMock>
          )
        }
      }

      const tree = TestUtils.renderIntoDocument(<OuterContainer />)
      const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      expect(stub.props.text).toBe('')
      stub.props.mergedAppend('a')
      expect(stub.props.text).toBe('HELLO az')
      stub.props.mergedAppend('b')
      expect(stub.props.text).toBe('HELLO azbz')
      tree.setState({ extra: 'Z' })
      stub.props.mergedAppend('c')
      expect(stub.props.text).toBe('HELLO azbzcZ')
    })

    it('should merge actionProps into WrappedComponent', () => {
      const store = Observable::of({
        foo: 'bar'
      })

      @connect(
        state => state,
        dispatch => ({ dispatch })
      )
      class Container extends Component {
        render() {
          return <Passthrough {...this.props} />
        }
      }

      const container = TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container pass="through" />
        </ProviderMock>
      )
      const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
      expect(stub.props.dispatch).toEqual(store.dispatch)
      expect(stub.props.foo).toEqual('bar')
      expect(() =>
        TestUtils.findRenderedComponentWithType(container, Container)
      ).toNotThrow()
      const decorated = TestUtils.findRenderedComponentWithType(container, Container)
      expect(decorated.isSubscribed()).toBe(true)
    })

    it('should not invoke mapState when props change if it only has one argument', () => {
      const store = Observable::of(1)

      let invocationCount = 0

      /*eslint-disable no-unused-vars */
      @connect((arg1) => {
        invocationCount++
        return {}
      })
      /*eslint-enable no-unused-vars */
      class WithoutProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithoutProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <OuterComponent ref={c => outerComponent = c} />
        </ProviderMock>
      )
      outerComponent.setFoo('BAR')
      outerComponent.setFoo('DID')

      expect(invocationCount).toEqual(1)
    })

    it('should invoke mapState every time props are changed if it has zero arguments', () => {
      const store = Observable::of(1)

      let invocationCount = 0

      @connect(() => {
        invocationCount++
        return {}
      })
      class WithoutProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithoutProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <OuterComponent ref={c => outerComponent = c} />
        </ProviderMock>
      )
      outerComponent.setFoo('BAR')
      outerComponent.setFoo('DID')

      expect(invocationCount).toEqual(3)
    })

    it('should invoke mapState every time props are changed if it has a second argument', () => {
      const store = Observable::of({})

      let propsPassedIn
      let invocationCount = 0

      @connect((state, props) => {
        invocationCount++
        propsPassedIn = props
        return {}
      })
      class WithProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <OuterComponent ref={c => outerComponent = c} />
        </ProviderMock>
      )

      outerComponent.setFoo('BAR')
      outerComponent.setFoo('BAZ')

      expect(invocationCount).toEqual(3)
      expect(propsPassedIn).toEqual({
        foo: 'BAZ'
      })
    })

    it('should not invoke mapDispatch when props change if it only has one argument', () => {
      const store = Observable::of({})

      let invocationCount = 0

      /*eslint-disable no-unused-vars */
      @connect(null, (arg1) => {
        invocationCount++
        return {}
      })
      /*eslint-enable no-unused-vars */
      class WithoutProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithoutProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <OuterComponent ref={c => outerComponent = c} />
        </ProviderMock>
      )

      outerComponent.setFoo('BAR')
      outerComponent.setFoo('DID')

      expect(invocationCount).toEqual(1)
    })

    it('should invoke mapDispatch every time props are changed if it has zero arguments', () => {
      const store = Observable::of({})

      let invocationCount = 0

      @connect(null, () => {
        invocationCount++
        return {}
      })
      class WithoutProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithoutProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <OuterComponent ref={c => outerComponent = c} />
        </ProviderMock>
      )

      outerComponent.setFoo('BAR')
      outerComponent.setFoo('DID')

      expect(invocationCount).toEqual(3)
    })

    it('should invoke mapDispatch every time props are changed if it has a second argument', () => {
      const store = Observable::of({})

      let propsPassedIn
      let invocationCount = 0

      @connect(null, (dispatch, props) => {
        invocationCount++
        propsPassedIn = props
        return {}
      })
      class WithProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <OuterComponent ref={c => outerComponent = c} />
        </ProviderMock>
      )

      outerComponent.setFoo('BAR')
      outerComponent.setFoo('BAZ')

      expect(invocationCount).toEqual(3)
      expect(propsPassedIn).toEqual({
        foo: 'BAZ'
      })
    })

    it('should pass dispatch and avoid subscription if arguments are falsy', () => {
      const store = Observable::of({
        foo: 'bar'
      })

      function runCheck(...connectArgs) {
        @connect(...connectArgs)
        class Container extends Component {
          render() {
            return <Passthrough {...this.props} />
          }
        }

        const container = TestUtils.renderIntoDocument(
          <ProviderMock store={store}>
            <Container pass="through" />
          </ProviderMock>
        )
        const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
        expect(stub.props.dispatch).toEqual(store.dispatch)
        expect(stub.props.foo).toBe(undefined)
        expect(stub.props.pass).toEqual('through')
        expect(() =>
          TestUtils.findRenderedComponentWithType(container, Container)
        ).toNotThrow()
        const decorated = TestUtils.findRenderedComponentWithType(container, Container)
        expect(decorated.isSubscribed()).toBe(false)
      }

      runCheck()
      runCheck(null, null, null)
      runCheck(false, false, false)
    })

    it('should unsubscribe before unmounting', () => {
      const store = Observable::of('')

      @connect(
        state => ({ string: state }),
        dispatch => ({ dispatch })
      )
      class Container extends Component {
        render() {
          return <Passthrough {...this.props} />
        }
      }

      let container
      const div = document.createElement('div')
      ReactDOM.render(
        <ProviderMock store={store}>
          <Container ref={instance => container = instance}/>
        </ProviderMock>,
        div
      )

      // Keep track of unsubscribe by wrapping subscribe()
      const spy = expect.spyOn(container.subscription, 'unsubscribe')

      expect(spy.calls.length).toBe(0)
      ReactDOM.unmountComponentAtNode(div)
      expect(spy.calls.length).toBe(1)
      spy.restore
    })

    it('should not attempt to set state after unmounting', () => {
      const action$ = new Subject
      const reducer$ = action$::map(str => state => state + str)
      const store = createStore(reducer$, Observable::of(''))
      let mapStateToPropsCalls = 0

      @connect(
        () => ({ calls: ++mapStateToPropsCalls }),
        dispatch => ({ dispatch })
      )
      class Container extends Component {
        render() {
          return <Passthrough {...this.props} />
        }
      }

      const div = document.createElement('div')
      store.subscribe(() =>
        ReactDOM.unmountComponentAtNode(div)
      )

      ReactDOM.render(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>,
        div
      )

      expect(mapStateToPropsCalls).toBe(1)
      const spy = expect.spyOn(console, 'error')
      action$.next('a')
      spy.destroy()
      expect(spy.calls.length).toBe(0)
      expect(mapStateToPropsCalls).toBe(1)
      action$.complete()
    })

    it('should not attempt to set state when dispatching in componentWillUnmount', () => {
      const action$ = new Subject
      const reducer$ = action$::map(str => state => state + str)
      const store = createStore(reducer$, Observable::of(''))

      let mapStateToPropsCalls = 0

      /*eslint-disable no-unused-vars */
      @connect(
        (state) => ({ calls: mapStateToPropsCalls++ }),
        dispatch => ({ dispatch })
      )
      /*eslint-enable no-unused-vars */
      class Container extends Component {
        componentWillUnmount() {
          action$.next('a')
        }
        render() {
          return <Passthrough {...this.props} />
        }
      }

      const div = document.createElement('div')
      ReactDOM.render(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>,
        div
      )
      expect(mapStateToPropsCalls).toBe(1)

      const spy = expect.spyOn(console, 'error')
      ReactDOM.unmountComponentAtNode(div)
      spy.destroy()
      expect(spy.calls.length).toBe(0)
      expect(mapStateToPropsCalls).toBe(1)
      action$.complete()
    })

    it('should shallowly compare the selected state to prevent unnecessary updates', () => {
      const action$ = new Subject
      const reducer$ = action$::map(str => state => state + str)
      const store = createStore(reducer$, Observable::of(''))
      const spy = expect.createSpy(() => ({}))
      function render({ string }) {
        spy()
        return <Passthrough string={string}/>
      }

      @connect(
        state => ({ string: state }),
        dispatch => ({ dispatch })
      )
      class Container extends Component {
        render() {
          return render(this.props)
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )

      const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      expect(spy.calls.length).toBe(1)
      expect(stub.props.string).toBe('')
      action$.next('a')
      expect(spy.calls.length).toBe(2)
      action$.next('b')
      expect(spy.calls.length).toBe(3)
      action$.next('')
      expect(spy.calls.length).toBe(3)
      action$.complete()
    })

    it('should shallowly compare the merged state to prevent unnecessary updates', () => {
      const action$ = new Subject
      const reducer$ = action$::map(str => state => state + str)
      const store = createStore(reducer$, Observable::of(''))
      const spy = expect.createSpy(() => ({}))
      function render({ string, pass }) {
        spy()
        return <Passthrough string={string} pass={pass} passVal={pass.val} />
      }

      @connect(
        state => ({ string: state }),
        dispatch => ({ dispatch }),
        (stateProps, dispatchProps, parentProps) => ({
          ...dispatchProps,
          ...stateProps,
          ...parentProps
        })
      )
      class Container extends Component {
        render() {
          return render(this.props)
        }
      }

      class Root extends Component {
        constructor(props) {
          super(props)
          this.state = { pass: '' }
        }

        render() {
          return (
            <ProviderMock store={store}>
              <Container pass={this.state.pass} />
            </ProviderMock>
          )
        }
      }

      const tree = TestUtils.renderIntoDocument(<Root />)
      const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      expect(spy.calls.length).toBe(1)
      expect(stub.props.string).toBe('')
      expect(stub.props.pass).toBe('')

      action$.next('a')
      expect(spy.calls.length).toBe(2)
      expect(stub.props.string).toBe('a')
      expect(stub.props.pass).toBe('')

      tree.setState({ pass: '' })
      expect(spy.calls.length).toBe(2)
      expect(stub.props.string).toBe('a')
      expect(stub.props.pass).toBe('')

      tree.setState({ pass: 'through' })
      expect(spy.calls.length).toBe(3)
      expect(stub.props.string).toBe('a')
      expect(stub.props.pass).toBe('through')

      tree.setState({ pass: 'through' })
      expect(spy.calls.length).toBe(3)
      expect(stub.props.string).toBe('a')
      expect(stub.props.pass).toBe('through')

      const obj = { prop: 'val' }
      tree.setState({ pass: obj })
      expect(spy.calls.length).toBe(4)
      expect(stub.props.string).toBe('a')
      expect(stub.props.pass).toBe(obj)

      tree.setState({ pass: obj })
      expect(spy.calls.length).toBe(4)
      expect(stub.props.string).toBe('a')
      expect(stub.props.pass).toBe(obj)

      const obj2 = Object.assign({}, obj, { val: 'otherval' })
      tree.setState({ pass: obj2 })
      expect(spy.calls.length).toBe(5)
      expect(stub.props.string).toBe('a')
      expect(stub.props.pass).toBe(obj2)

      obj2.val = 'mutation'
      tree.setState({ pass: obj2 })
      expect(spy.calls.length).toBe(5)
      expect(stub.props.string).toBe('a')
      expect(stub.props.passVal).toBe('otherval')

      action$.complete()
    })

    it('should throw an error if mapState, mapDispatch, or mergeProps returns anything but a plain object', () => {
      const store = Observable::of({})

      function makeContainer(mapState, mapDispatch, mergeProps) {
        return React.createElement(
          @connect(mapState, mapDispatch, mergeProps)
          class Container extends Component {
            render() {
              return <Passthrough />
            }
          }
        )
      }

      function AwesomeMap() { }

      let spy = expect.spyOn(console, 'error')
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          {makeContainer(() => 1, () => ({}), () => ({}))}
        </ProviderMock>
      )
      expect(spy.calls.length).toBe(1)
      expect(spy.calls[0].arguments[0]).toMatch(
        /mapStateToProps\(\) in Connect\(Container\) must return a plain object/
      )
      spy.destroy()

      spy = expect.spyOn(console, 'error')
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          {makeContainer(() => 'hey', () => ({}), () => ({}))}
        </ProviderMock>
      )
      expect(spy.calls.length).toBe(1)
      expect(spy.calls[0].arguments[0]).toMatch(
        /mapStateToProps\(\) in Connect\(Container\) must return a plain object/
      )
      spy.destroy()

      spy = expect.spyOn(console, 'error')
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          {makeContainer(() => new AwesomeMap(), () => ({}), () => ({}))}
        </ProviderMock>
      )
      expect(spy.calls.length).toBe(1)
      expect(spy.calls[0].arguments[0]).toMatch(
        /mapStateToProps\(\) in Connect\(Container\) must return a plain object/
      )
      spy.destroy()

      spy = expect.spyOn(console, 'error')
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          {makeContainer(() => ({}), () => 1, () => ({}))}
        </ProviderMock>
      )
      expect(spy.calls.length).toBe(1)
      expect(spy.calls[0].arguments[0]).toMatch(
        /mapDispatchToProps\(\) in Connect\(Container\) must return a plain object/
      )
      spy.destroy()

      spy = expect.spyOn(console, 'error')
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          {makeContainer(() => ({}), () => 'hey', () => ({}))}
        </ProviderMock>
      )
      expect(spy.calls.length).toBe(1)
      expect(spy.calls[0].arguments[0]).toMatch(
        /mapDispatchToProps\(\) in Connect\(Container\) must return a plain object/
      )
      spy.destroy()

      spy = expect.spyOn(console, 'error')
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          {makeContainer(() => ({}), () => new AwesomeMap(), () => ({}))}
        </ProviderMock>
      )
      expect(spy.calls.length).toBe(1)
      expect(spy.calls[0].arguments[0]).toMatch(
        /mapDispatchToProps\(\) in Connect\(Container\) must return a plain object/
      )
      spy.destroy()

      spy = expect.spyOn(console, 'error')
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          {makeContainer(() => ({}), () => ({}), () => 1)}
        </ProviderMock>
      )
      expect(spy.calls.length).toBe(1)
      expect(spy.calls[0].arguments[0]).toMatch(
        /mergeProps\(\) in Connect\(Container\) must return a plain object/
      )
      spy.destroy()

      spy = expect.spyOn(console, 'error')
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          {makeContainer(() => ({}), () => ({}), () => 'hey')}
        </ProviderMock>
      )
      expect(spy.calls.length).toBe(1)
      expect(spy.calls[0].arguments[0]).toMatch(
        /mergeProps\(\) in Connect\(Container\) must return a plain object/
      )
      spy.destroy()

      spy = expect.spyOn(console, 'error')
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          {makeContainer(() => ({}), () => ({}), () => new AwesomeMap())}
        </ProviderMock>
      )
      expect(spy.calls.length).toBe(1)
      expect(spy.calls[0].arguments[0]).toMatch(
        /mergeProps\(\) in Connect\(Container\) must return a plain object/
      )
      spy.destroy()
    })

    it('should recalculate the state and rebind the actions on hot update', () => {
      const store = Observable::of({})

      @connect(
        null,
        () => ({ scooby: 'doo' })
      )
      class ContainerBefore extends Component {
        render() {
          return (
            <Passthrough {...this.props} />
          )
        }
      }

      @connect(
        () => ({ foo: 'baz' }),
        () => ({ scooby: 'foo' })
      )
      class ContainerAfter extends Component {
        render() {
          return (
            <Passthrough {...this.props} />
          )
        }
      }

      @connect(
        () => ({ foo: 'bar' }),
        () => ({ scooby: 'boo' })
      )
      class ContainerNext extends Component {
        render() {
          return (
            <Passthrough {...this.props} />
          )
        }
      }

      let container
      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <ContainerBefore ref={instance => container = instance} />
        </ProviderMock>
      )
      const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
      expect(stub.props.foo).toEqual(undefined)
      expect(stub.props.scooby).toEqual('doo')

      function imitateHotReloading(TargetClass, SourceClass) {
        // Crude imitation of hot reloading that does the job
        Object.getOwnPropertyNames(SourceClass.prototype).filter(key =>
          typeof SourceClass.prototype[key] === 'function'
        ).forEach(key => {
          if (key !== 'render' && key !== 'constructor') {
            TargetClass.prototype[key] = SourceClass.prototype[key]
          }
        })

        container.forceUpdate()
      }

      imitateHotReloading(ContainerBefore, ContainerAfter)
      expect(stub.props.foo).toEqual('baz')
      expect(stub.props.scooby).toEqual('foo')

      imitateHotReloading(ContainerBefore, ContainerNext)
      expect(stub.props.foo).toEqual('bar')
      expect(stub.props.scooby).toEqual('boo')
    })

    it('should set the displayName correctly', () => {
      expect(connect(state => state)(
        class Foo extends Component {
          render() {
            return <div />
          }
        }
      ).displayName).toBe('Connect(Foo)')

      expect(connect(state => state)(
        createClass({
          displayName: 'Bar',
          render() {
            return <div />
          }
        })
      ).displayName).toBe('Connect(Bar)')

      expect(connect(state => state)(
        createClass({
          render() {
            return <div />
          }
        })
      ).displayName).toBe('Connect(Component)')
    })

    it('should expose the wrapped component as WrappedComponent', () => {
      class Container extends Component {
        render() {
          return <Passthrough />
        }
      }

      const decorator = connect(state => state)
      const decorated = decorator(Container)

      expect(decorated.WrappedComponent).toBe(Container)
    })

    it('should hoist non-react statics from wrapped component', () => {
      @connect(state => state)
      class Container extends Component {
        static howIsRx = () => 'Awesome!'
        static foo = 'bar'
        render() {
          return <Passthrough />
        }
      }

      expect(Container.howIsRx).toBeA('function')
      expect(Container.howIsRx()).toBe('Awesome!')
      expect(Container.foo).toBe('bar')
    })

    it('should use the store from the props instead of from the context if present', () => {
      let actualState

      @connect(state => {
        actualState = state
        return {}
      })
      class Container extends Component {
        render() {
          return <Passthrough />
        }
      }

      const expectedState = { foos: {} }
      const mockStore = Observable::of({
        ...expectedState
      })

      TestUtils.renderIntoDocument(<Container store={mockStore} />)

      expect(actualState).toEqual(expectedState)
    })

    it('should throw an error if the store is not in the props or context', () => {
      @connect(() => {})
      class Container extends Component {
        render() {
          return <Passthrough />
        }
      }

      expect(() =>
        TestUtils.renderIntoDocument(<Container />)
      ).toThrow(
        /Could not find "store"/
      )
    })

    it('should throw when trying to access the wrapped instance if withRef is not specified', () => {
      const store = Observable::of({})

      @connect(state => state)
      class Container extends Component {
        render() {
          return <Passthrough />
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )

      const container = TestUtils.findRenderedComponentWithType(tree, Container)
      expect(() => container.getWrappedInstance()).toThrow(
        /To access the wrapped instance, you need to specify \{ withRef: true \} as the fourth argument of the connect\(\) call\./
      )
    })

    it('should return the instance of the wrapped component for use in calling child methods', () => {
      const store = Observable::of({})

      const someData = {
        some: 'data'
      }

      @connect(state => state, null, null, { withRef: true })
      class Container extends Component {
        someInstanceMethod() {
          return someData
        }

        render() {
          return <Passthrough />
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )

      const container = TestUtils.findRenderedComponentWithType(tree, Container)

      expect(() => container.someInstanceMethod()).toThrow()
      expect(container.getWrappedInstance().someInstanceMethod()).toBe(someData)
      expect(container.wrappedInstance.someInstanceMethod()).toBe(someData)
    })

    it('should wrap impure components without supressing updates', () => {
      const store = Observable::of({})

      @connect(state => state, null, null, { pure: false })
      class ImpureComponent extends Component {
        static contextTypes = {
          statefulValue: React.PropTypes.number
        }
        render() {
          return <Passthrough statefulValue={this.context.statefulValue} />
        }
      }

      class StatefulWrapper extends Component {
        constructor() {
          super()
          this.state = { value: 0 }
        }

        getChildContext() {
          return {
            statefulValue: this.state.value
          }
        }

        render() {
          return <ImpureComponent />
        }
      }

      StatefulWrapper.childContextTypes = {
        statefulValue: React.PropTypes.number
      }

      const tree = TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <StatefulWrapper />
        </ProviderMock>
      )

      const target = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      const wrapper = TestUtils.findRenderedComponentWithType(tree, StatefulWrapper)
      expect(target.props.statefulValue).toEqual(0)
      wrapper.setState({ value: 1 })
      expect(target.props.statefulValue).toEqual(1)
    })

    it('calls mapState and mapDispatch for impure components', () => {
      const store = Observable::of({
        foo: 'foo',
        bar: 'bar'
      })

      const mapStateSpy = expect.createSpy()
      const mapDispatchSpy = expect.createSpy().andReturn({})

      @connect(
        (state, { storeGetter }) => {
          mapStateSpy()
          return { value: state[storeGetter.storeKey] }
        },
        mapDispatchSpy,
        null,
        { pure: false }
      )
      class ImpureComponent extends Component {
        render() {
          return <Passthrough statefulValue={this.props.value} />
        }
      }

      class StatefulWrapper extends Component {
        constructor() {
          super()
          this.state = {
            storeGetter: { storeKey: 'foo' }
          }
        }
        render() {
          return <ImpureComponent storeGetter={this.state.storeGetter} />
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <StatefulWrapper />
        </ProviderMock>
      )

      const target = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      const wrapper = TestUtils.findRenderedComponentWithType(tree, StatefulWrapper)

      expect(mapStateSpy.calls.length).toBe(2)
      expect(mapDispatchSpy.calls.length).toBe(2)
      expect(target.props.statefulValue).toEqual('foo')

      // Impure update
      const storeGetter = wrapper.state.storeGetter
      storeGetter.storeKey = 'bar'
      wrapper.setState({ storeGetter })

      expect(mapStateSpy.calls.length).toBe(3)
      expect(mapDispatchSpy.calls.length).toBe(3)
      expect(target.props.statefulValue).toEqual('bar')
    })

    it('should pass state consistently to mapState', () => {
      const action$ = new Subject
      const reducer$ = action$::map(str => state => state + str)
      const store = createStore(reducer$, Observable::of(''))

      action$.next('a')
      let childMapStateInvokes = 0

      @connect(state => ({ state }), null, null, { withRef: true })
      class Container extends Component {

        emitChange() {
          action$.next('b')
        }

        render() {
          return (
            <div>
              <button ref="button" onClick={this.emitChange.bind(this)}>change</button>
              <ChildContainer parentState={this.props.state} />
            </div>
          )
        }
      }

      @connect((state, parentProps) => {
        childMapStateInvokes++
        // The state from parent props should always be consistent with the current state
        expect(state).toEqual(parentProps.parentState)
        return {}
      })
      class ChildContainer extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )

      expect(childMapStateInvokes).toBe(1)

      // The store state stays consistent when setState calls are batched
      ReactDOM.unstable_batchedUpdates(() => {
        action$.next('b')
      })
      expect(childMapStateInvokes).toBe(2)

      // setState calls DOM handlers are batched
      const container = TestUtils.findRenderedComponentWithType(tree, Container)
      const node = container.getWrappedInstance().refs.button
      TestUtils.Simulate.click(node)
      expect(childMapStateInvokes).toBe(3)
    })

    it('should not render the wrapped component when mapState does not produce change', () => {
      const action$ = new Subject
      const reducer$ = action$::map(str => state => state + str)
      const store = createStore(reducer$, Observable::of(''))
      let renderCalls = 0
      let mapStateCalls = 0

      @connect(() => {
        mapStateCalls++
        return {} // no change!
      })
      class Container extends Component {
        render() {
          renderCalls++
          return <Passthrough {...this.props} />
        }
      }

      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )

      expect(renderCalls).toBe(1)
      expect(mapStateCalls).toBe(1)

      action$.next('a')

      // After store a change mapState has been called
      expect(mapStateCalls).toBe(2)
      // But render is not because it did not make any actual changes
      expect(renderCalls).toBe(1)
    })

    it('should bail out early if mapState does not depend on props', () => {
      const action$ = new Subject
      const reducer$ = action$::map(str => state => state + str)
      const store = createStore(reducer$, Observable::of(''))

      let renderCalls = 0
      let mapStateCalls = 0

      @connect(state => {
        mapStateCalls++
        return state === 'aaa' ? { change: 1 } : {}
      })
      class Container extends Component {
        render() {
          renderCalls++
          return <Passthrough {...this.props} />
        }
      }

      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )

      expect(renderCalls).toBe(1)
      expect(mapStateCalls).toBe(1)

      const spy = expect.spyOn(Container.prototype, 'setState').andCallThrough()

      action$.next('a')
      expect(mapStateCalls).toBe(2)
      expect(renderCalls).toBe(1)
      expect(spy.calls.length).toBe(0)

      action$.next('a')
      expect(mapStateCalls).toBe(3)
      expect(renderCalls).toBe(1)
      expect(spy.calls.length).toBe(0)

      action$.next('a')
      expect(mapStateCalls).toBe(4)
      expect(renderCalls).toBe(2)
      expect(spy.calls.length).toBe(1)

      spy.destroy()
    })

    it('should not swallow errors when bailing out early', () => {
      const action$ = new Subject
      const reducer$ = action$::map(str => state => state + str)
      const store = createStore(reducer$, Observable::of(''))

      let renderCalls = 0
      let mapStateCalls = 0

      @connect(state => {
        mapStateCalls++
        if (state === 'a') {
          throw new Error('Oops')
        } else {
          return {}
        }
      })
      class Container extends Component {
        render() {
          renderCalls++
          return <Passthrough {...this.props} />
        }
      }

      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )

      expect(renderCalls).toBe(1)
      expect(mapStateCalls).toBe(1)
      expect(
        () => action$.next('a')
      ).toThrow('Oops')
    })

    it('should allow providing a factory function to mapStateToProps', () => {
      let updatedCount = 0
      let memoizedReturnCount = 0
      const action$ = new Subject
      const reducer$ = action$::map(() => state => state)
      const store = Observable::of({ value: 1 })

      const mapStateFactory = () => {
        let lastProp, lastVal, lastResult
        return (state, props) => {
          if (props.name === lastProp && lastVal === state.value) {
            memoizedReturnCount++
            return lastResult
          }
          lastProp = props.name
          lastVal = state.value
          return lastResult = { someObject: { prop: props.name, stateVal: state.value } }
        }
      }

      @connect(mapStateFactory)
      class Container extends Component {
        componentWillUpdate() {
          updatedCount++
        }
        render() {
          return <Passthrough {...this.props} />
        }
      }

      TestUtils.renderIntoDocument(
        <ProviderMock store={store}>
          <div>
            <Container name="a" />
            <Container name="b" />
          </div>
        </ProviderMock>
      )

      action$.next()
      expect(updatedCount).toBe(0)
      expect(memoizedReturnCount).toBe(2)
    })
  })
})
