import { Observable } from 'rxjs/Observable'
import { of } from 'rxjs/observable/of'
import { merge } from 'rxjs/operator/merge'
import { scan } from 'rxjs/operator/scan'
import { publishReplay } from 'rxjs/operator/publishReplay'

const createStore = (reducer$, initialState$ = Observable::of({})) => initialState$
  ::merge(reducer$)
  ::scan((state, reducer) => reducer(state))
  ::publishReplay(1)
  .refCount()

export default createStore
