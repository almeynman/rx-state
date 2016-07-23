import { Observable } from 'rxjs/Observable'
import { of } from 'rxjs/observable/of'
import { merge } from 'rxjs/operator/merge'
import { scan } from 'rxjs/operator/scan'
import { publishReplay } from 'rxjs/operator/publishReplay'
import ActionFactory from './ActionFactory'

const createStore = (reducer$, initialState$ = Observable::of({})) => {
  const store = initialState$
    ::merge(reducer$)
    ::scan((state, reducer) => reducer(state))
    ::publishReplay(1)
    .refCount()

  store.actions = new ActionFactory
  store.dispatch = ({ type, value }) => store.actions.get(type).next(value)
  return store
}

export default createStore
