import { Subject } from 'rxjs/Subject'
import _ from 'lodash'

export default class ActionFactory {
  actions = {}

  get(actionName) {
    let action = this.actions[actionName]

    if (action) {
      return action
    }

    action = this.actions[actionName] = new Subject
    return action
  }

  list(regex) {
    return _.keys(this.actions).filter(actionName => actionName.match(regex))
  }
}
