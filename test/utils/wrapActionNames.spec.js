import expect from 'expect'
import Subject from 'rxjs/Subject'
import wrapActionNames from '../../src/utils/wrapActionNames'
import ActionFactory from '../../src'

describe('Utils', () => {
  describe('wrapActionNames', () => {
    it('should return an object with bindedActions as values', () => {
      const actions = new ActionFactory
      const wrapped = wrapActionNames({
        doSomething: 'hello'
      }, actions)
      expect(wrapped.doSomething).toBeA(Subject)
    })
  })
})
