import expect from 'expect'
import wrapActionNames from '../../src/utils/wrapActionNames'
import { ActionFactory } from '../../src'

describe('Utils', () => {
  describe('wrapActionNames', () => {
    it('should return an object with bindedActions as values', () => {
      const actionFactory = new ActionFactory
      const wrapped = wrapActionNames({
        doSomething: 'hello'
      }, actionFactory)
      expect(wrapped.doSomething).toBeA(Function)
    })

    it('should return an object with bounded actions if array is passed', () => {
      const actionFactory = new ActionFactory
      const wrapped = wrapActionNames([
        'doSomething'
      ], actionFactory)
      expect(wrapped.doSomething).toBeA(Function)
    })
  })
})
