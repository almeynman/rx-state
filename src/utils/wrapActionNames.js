import _ from 'lodash'
import bindAction from '../store/bindAction'

export default function wrapActionNames(actionNames, actionFactory) {
  return _.transform(actionNames, (result, value, key) => {
    const subject = value ? actionFactory.get(value) : actionFactory.get(key)
    result[key] = bindAction(subject)
  }, {})
}
