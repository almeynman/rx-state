require('babel-core/register')
require('babel-polyfill')
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, createStore, ActionFactory } from '../../../lib'
import Hello from './Hello'

import { map } from 'rxjs/operator/map'

const actionFactory = new ActionFactory
actionFactory.get('updateName').subscribe(name => console.log(name))
const reducer$ = actionFactory.get('updateName')::map(name => state => ({ ...state, name }))
const store = createStore(reducer$)

ReactDOM.render(
  <Provider store={store} actionFactory={actionFactory}>
    <Hello hello="Ola" />
  </Provider>,
  document.getElementById('root')
)
