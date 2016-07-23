import { Subject } from 'rxjs/Subject'

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
    return Object.keys(this.actions).filter(actionName => actionName.match(regex))
  }
}
