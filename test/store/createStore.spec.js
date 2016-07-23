import expect from 'expect'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { createStore } from '../../src'
import { of } from 'rxjs/observable/of'
import { toArray } from 'rxjs/operator/toArray'

describe('createStore', () => {

  it('creates state$', done => {
    const reducer$ = new Subject
    const reducer = state => ({ ...state, counter: (state.counter || 0) + 1 })
    const state$ = createStore(reducer$)

    state$::toArray().subscribe(results => {
      expect(results).toEqual([
        {},
        { counter: 1 },
        { counter: 2 },
        { counter: 3 }
      ])
    }, () => {}, done)

    reducer$.next(reducer)
    reducer$.next(reducer)
    reducer$.next(reducer)
    reducer$.complete()
  })

  it('creates state$ with initialState$', done => {
    const reducer$ = new Subject
    const initialState$ = Observable::of({ counter: -10 })
    const reducer = state => ({ ...state, counter: state.counter + 1 })
    const state$ = createStore(reducer$, initialState$)

    state$::toArray().subscribe(results => {
      expect(results).toEqual([
        { counter: -10 },
        { counter: -9 },
        { counter: -8 },
        { counter: -7 }
      ])
    }, () => {}, done)

    reducer$.next(reducer)
    reducer$.next(reducer)
    reducer$.next(reducer)
    reducer$.complete()
  })
})
