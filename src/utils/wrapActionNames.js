import _ from 'lodash'
import bindAction from '../store/bindAction'

export default function wrapActionNames(actionNames, actionFactory) {
  if (_.isPlainObject(actionNames)) {
    return _.transform(actionNames, (result, value, key) => {
      const subject = value ? actionFactory.get(value) : actionFactory.get(key)
      result[key] = bindAction(subject)
    }, {})
  }

  const result = {}
  actionNames.forEach(
    actionName => result[actionName] = bindAction(actionFactory.get(actionName))
  )
  return result
}
