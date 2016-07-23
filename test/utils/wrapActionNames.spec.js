import expect from 'expect'
import Subject from 'rxjs/Subject'
import wrapActionNames from '../../utils/wrapActionNames'

describe('Utils', () => {
  describe('wrapActionNames', () => {
    it('should return an object with bindedActions as values', () => {
      const wrapped = wrapActionNames({
        doSomething: 'hello'
      })
      expect(wrapped.doSomething).toBeA(Subject)
    })
  })
})
