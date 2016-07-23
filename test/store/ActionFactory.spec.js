import expect from 'expect'
import { Subject } from 'rxjs/Subject'
import { ActionFactory } from '../../src'

describe('ActionFactory', () => {
  it('`get` should create new Subject on get', () => {
    const actions = new ActionFactory
    expect(actions.get('increment')).toBeA(Subject)
  })

  it('`get` should not create another subject for the same action name', () => {
    const actions = new ActionFactory
    actions.get('increment')
    actions.get('increment')
    expect(Object.keys(actions.actions).length).toBe(1)
  })

  it('`list` should list actions given a regex', () => {
    const actions = new ActionFactory
    actions.get('counter.increment')
    actions.get('counter.decrement')
    expect(actions.list(/counter/)).toEqual([
      'counter.increment',
      'counter.decrement'
    ])
  })
})
