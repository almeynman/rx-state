import expect from 'expect'
import { Subject } from 'rxjs/Subject'
import { bindAction } from '../../src'
import { toArray } from 'rxjs/operator/toArray'

describe('bindAction', () => {

  it('wraps subject.next', done => {
    const action$ = new Subject
    const action = bindAction(action$)

    action$::toArray().subscribe(result => {
      expect(result).toEqual([ 'foo', 'bar' ])
    }, () => {}, done)

    action('foo')
    action('bar')
    action$.complete()
  })
})
